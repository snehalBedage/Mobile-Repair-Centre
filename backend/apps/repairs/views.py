from django.shortcuts import get_object_or_404
from django.utils import timezone



from apps.reports.audit import create_audit_log
from django.db import transaction

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.pagination import PageNumberPagination


from .models import Technician, JobCard, StatusHistory, Estimate,Warranty

from .serializers import (
    TechnicianSerializer,
    TechnicianStatusSerializer,
    JobCardSerializer,
    JobCardStatusUpdateSerializer,
    StatusHistorySerializer,
    EstimateSerializer,
EstimateApprovalSerializer,
    WarrantySerializer,
    WarrantyStatusSerializer,
)

from .permissions import (
    IsAdminOrStaff,
     IsAdminOnly,
    IsAdminStaffOrOwnJobCard,
     IsAdminStaffOrOwnEstimate,
    IsCustomer,
)


# =========================================================
# Technician APIs
# =========================================================

class TechnicianListCreateView(generics.ListCreateAPIView):

    serializer_class = TechnicianSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):

        queryset = Technician.objects.all()

        search = self.request.query_params.get('search')

        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                mobile__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                specialization__icontains=search
            )

        return queryset

# =========================================================
# Technician Status Update API
# =========================================================

class TechnicianStatusUpdateView(generics.UpdateAPIView):

    queryset = Technician.objects.all()

    serializer_class = TechnicianStatusSerializer

    permission_classes = [
        IsAdminOnly
    ]

    def update(self, request, *args, **kwargs):

        technician = self.get_object()

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        new_status = serializer.validated_data[
            'status'
        ]

        technician.status = new_status

        technician.save()

        return Response(
            {
                'message':
                    'Technician status updated successfully.',

                'technician_id':
                    technician.id,

                'technician_name':
                    technician.name,

                'status':
                    technician.status,
            },
            status=status.HTTP_200_OK
        )


class TechnicianDetailView(generics.RetrieveUpdateAPIView):

    queryset = Technician.objects.all()

    serializer_class = TechnicianSerializer

    permission_classes = [IsAdminOrStaff]


# =========================================================
# Job Card APIs
# =========================================================




class JobCardDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = JobCardSerializer
    permission_classes = [IsAdminStaffOrOwnJobCard]

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return JobCard.objects.select_related(
                'customer',
                'customer__user',
                'device',
                'technician'
            ).all()

        return JobCard.objects.filter(
            customer__user=user
        ).select_related(
            'customer',
            'customer__user',
            'device',
            'technician'
        )
class JobCardListCreateView(generics.ListCreateAPIView):

    serializer_class = JobCardSerializer

    def get_queryset(self):

        user = self.request.user

        # =====================================================
        # ADMIN / STAFF
        # =====================================================

        if user.role in ['ADMIN', 'STAFF']:

            queryset = JobCard.objects.select_related(
                'customer',
                'customer__user',
                'device',
                'technician'
            ).all()

        # =====================================================
        # CUSTOMER
        # =====================================================

        else:

            queryset = JobCard.objects.filter(
                customer__user=user
            ).select_related(
                'customer',
                'customer__user',
                'device',
                'technician'
            )

        # =====================================================
        # SEARCH
        # =====================================================

        search = self.request.query_params.get('search')

        if search:

            queryset = queryset.filter(
                job_card_number__icontains=search
            ) | queryset.filter(
                customer__name__icontains=search
            ) | queryset.filter(
                device__brand__icontains=search
            ) | queryset.filter(
                device__model__icontains=search
            ) | queryset.filter(
                status__icontains=search
            ) | queryset.filter(
                priority__icontains=search
            )

        return queryset

    # =====================================================
    # PERMISSIONS
    # =====================================================

    def get_permissions(self):

        if self.request.method == 'POST':
            return [IsAdminOrStaff()]

        return [IsAdminStaffOrOwnJobCard()]
# =========================================================
# Job Card Status Update API
# =========================================================



class JobCardStatusUpdateView(generics.UpdateAPIView):

    queryset = JobCard.objects.all()
    serializer_class = JobCardStatusUpdateSerializer
    permission_classes = [IsAdminOrStaff]

    def update(self, request, *args, **kwargs):

        job_card = self.get_object()

        # Prevent any status changes after rejection
        if job_card.status == JobCard.Status.REJECTED:
            return Response(
                {
                    'detail': (
                        'Rejected Job Cards cannot move '
                        'to another status.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        remarks = serializer.validated_data.get('remarks', '')

        # Approval and rejection must use Estimate Approval API
        if new_status in (
            JobCard.Status.APPROVED,
            JobCard.Status.REJECTED,
        ):
            return Response(
                {
                    'detail': (
                        'Approval or rejection must be '
                        'submitted through the Estimate Approval API.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = job_card.status

        # Prevent duplicate status updates
        if old_status == new_status:
            return Response(
                {'detail': 'Job Card is already in this status.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Repair cannot start without an approved estimate
        if new_status == JobCard.Status.REPAIR_IN_PROGRESS:

            approved_estimate_exists = Estimate.objects.filter(
                job_card=job_card,
                approval_status=Estimate.ApprovalStatus.APPROVED
            ).exists()

            if not approved_estimate_exists:
                return Response(
                    {
                        'detail': (
                            'Repair cannot start until the customer '
                            'approves the estimate.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Prevent completion before QC and delivery readiness
        if new_status == JobCard.Status.COMPLETED:
            if old_status != JobCard.Status.READY_FOR_DELIVERY:
                return Response(
                    {
                        'detail': (
                            'Job Card must pass QC and be marked '
                            'Ready for Delivery before completion.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Handle completion date
        if new_status == JobCard.Status.COMPLETED:
            job_card.completed_date = timezone.now()

        elif old_status == JobCard.Status.COMPLETED:
            job_card.completed_date = None

        # Update Job Card status
        job_card.status = new_status
        job_card.save()

        # Create audit log
        create_audit_log(
            user=request.user,
            action=f"Job Card status changed to {new_status}",
            table_name="JOB_CARDS",
            record_id=job_card.id
        )

        # Create status history
        StatusHistory.objects.create(
            job_card=job_card,
            status=new_status,
            remarks=remarks,
            changed_by=request.user
        )

        # Return response
        return Response(
            {
                'message': 'Job Card status updated successfully.',
                'job_card_id': job_card.id,
                'job_card_number': job_card.job_card_number,
                'old_status': old_status,
                'new_status': new_status,
                'remarks': remarks,
                'completed_date': job_card.completed_date,
            },
            status=status.HTTP_200_OK
        )

# =========================================================
# Job Card Status History API
# =========================================================

class JobCardStatusHistoryView(generics.ListAPIView):

    serializer_class = StatusHistorySerializer

    permission_classes = [
        IsAdminStaffOrOwnJobCard
    ]

    def get_queryset(self):

        job_card = get_object_or_404(
            JobCard,
            pk=self.kwargs['pk']
        )

        # -------------------------------------------------
        # Customer Ownership Check
        # -------------------------------------------------

        if (
            self.request.user.role == 'CUSTOMER'
            and job_card.customer.user != self.request.user
        ):

            return StatusHistory.objects.none()

        # -------------------------------------------------
        # Return Status History
        # -------------------------------------------------

        return StatusHistory.objects.filter(
            job_card=job_card
        ).select_related(
            'changed_by'
        ).order_by(
            '-changed_at'
        )
# Estimate List and Create View
class EstimateListCreateView(generics.ListCreateAPIView):

    serializer_class = EstimateSerializer

    def get_queryset(self):

        user = self.request.user

        # =====================================================
        # ADMIN / STAFF
        # =====================================================

        if user.role in ['ADMIN', 'STAFF']:

            queryset = Estimate.objects.select_related(
                'job_card',
                'job_card__customer',
                'job_card__device',
                'approved_by'
            ).all()

        # =====================================================
        # CUSTOMER
        # =====================================================

        else:

            queryset = Estimate.objects.filter(
                job_card__customer__user=user
            ).select_related(
                'job_card',
                'job_card__customer',
                'job_card__device',
                'approved_by'
            )

        # =====================================================
        # SEARCH
        # =====================================================

        search = self.request.query_params.get('search')

        if search:

            queryset = queryset.filter(
                job_card__job_card_number__icontains=search
            ) | queryset.filter(
                job_card__customer__name__icontains=search
            ) | queryset.filter(
                job_card__device__brand__icontains=search
            ) | queryset.filter(
                job_card__device__model__icontains=search
            ) | queryset.filter(
                approval_status__icontains=search
            )

        return queryset

    # =====================================================
    # PERMISSIONS
    # =====================================================

    def get_permissions(self):

        if self.request.method == 'POST':
            return [IsAdminOrStaff()]

        return [IsAdminStaffOrOwnJobCard()]
# Estimate Detail View

class EstimateDetailView(generics.RetrieveAPIView):
    """
    ADMIN/STAFF can view any estimate.
    CUSTOMER can view only their own estimate.
    Customers must use the approval API to approve/reject.
    """

    serializer_class = EstimateSerializer
    permission_classes = [IsAdminStaffOrOwnEstimate]

    def get_queryset(self):
        user = self.request.user

        queryset = Estimate.objects.select_related(
            'job_card',
            'job_card__customer',
            'job_card__device',
            'approved_by',
        )

        if user.role in ['ADMIN', 'STAFF']:
            return queryset.all()

        return queryset.filter(
            job_card__customer__user=user
        )

# Estimate Approval View



# Estimate Approval View

class EstimateApprovalView(generics.UpdateAPIView):

    serializer_class = EstimateApprovalSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return Estimate.objects.filter(
            job_card__customer__user=self.request.user
        ).select_related(
            'job_card',
            'job_card__customer'
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):

        estimate = self.get_object()

        estimate = Estimate.objects.select_for_update().get(
            pk=estimate.pk
        )

        job_card = JobCard.objects.select_for_update().get(
            pk=estimate.job_card_id
        )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        approval_status = serializer.validated_data[
            'approval_status'
        ]
        remarks = serializer.validated_data.get('remarks', '')

        # Only pending estimates can be approved or rejected
        if estimate.approval_status != Estimate.ApprovalStatus.PENDING:
            return Response(
                {
                    'detail': (
                        'This estimate has already been '
                        'approved or rejected.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Job Card must be waiting for customer approval
        if job_card.status != JobCard.Status.WAITING_FOR_APPROVAL:
            return Response(
                {
                    'detail': (
                        'This Job Card is not waiting for '
                        'estimate approval.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save customer decision
        estimate.approval_status = approval_status
        estimate.approved_by = request.user
        estimate.approved_at = timezone.now()

        estimate.save(
            update_fields=[
                'approval_status',
                'approved_by',
                'approved_at',
                'updated_at'
            ]
        )

        # Update Job Card based on customer decision
        if approval_status == Estimate.ApprovalStatus.APPROVED:
            new_status = JobCard.Status.APPROVED
            history_remarks = 'Customer approved the estimate.'
        else:
            new_status = JobCard.Status.REJECTED
            history_remarks = 'Customer rejected the estimate.'

        job_card.status = new_status
        job_card.save(
            update_fields=['status', 'updated_at']
        )

        # Record status history
        StatusHistory.objects.create(
            job_card=job_card,
            status=new_status,
            remarks=remarks or history_remarks,
            changed_by=request.user
        )

        # Audit log
        create_audit_log(
            user=request.user,
            action=f"Estimate {approval_status.lower()}",
            table_name="ESTIMATES",
            record_id=estimate.id
        )

        return Response(
            {
                'message': (
                    f'Estimate {approval_status.lower()} successfully.'
                ),
                'estimate_id': estimate.id,
                'job_card_id': job_card.id,
                'job_card_number': job_card.job_card_number,
                'approval_status': estimate.approval_status,
                'job_card_status': job_card.status,
            },
            status=status.HTTP_200_OK
        )


class WarrantyListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role == 'CUSTOMER':

            warranties = Warranty.objects.filter(
                job_card__customer__user=request.user
            ).select_related(
                'job_card',
                'job_card__customer',
                'job_card__device'
            )

        elif request.user.role in ['ADMIN', 'STAFF']:

            warranties = Warranty.objects.all().select_related(
                'job_card',
                'job_card__customer',
                'job_card__device'
            )

        else:

            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to view warranties."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ==============================
        # SEARCH
        # ==============================

        search = request.query_params.get('search')

        if search:

            warranties = warranties.filter(
                warranty_number__icontains=search
            ) | warranties.filter(
                job_card__job_card_number__icontains=search
            ) | warranties.filter(
                job_card__customer__name__icontains=search
            ) | warranties.filter(
                job_card__device__brand__icontains=search
            ) | warranties.filter(
                job_card__device__model__icontains=search
            ) | warranties.filter(
                status__icontains=search
            )

        # ==============================
        # ORDERING
        # ==============================

        warranties = warranties.order_by('-id')

        # ==============================
        # PAGINATION
        # ==============================

        paginator = PageNumberPagination()
        paginator.page_size = 10

        paginated_warranties = paginator.paginate_queryset(
            warranties,
            request
        )

        serializer = WarrantySerializer(
            paginated_warranties,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    def post(self, request):

        if request.user.role not in ['ADMIN', 'STAFF']:

            return Response(
                {
                    "detail": (
                        "Only Admin or Staff can create warranties."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WarrantySerializer(
            data=request.data
        )

        if serializer.is_valid():

            warranty = serializer.save()

            return Response(
                WarrantySerializer(warranty).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class WarrantyDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):

        return get_object_or_404(
            Warranty.objects.select_related(
                'job_card',
                'job_card__customer',
                'job_card__device'
            ),
            id=pk
        )

    def get(self, request, pk):

        warranty = self.get_object(pk)

        if request.user.role == 'CUSTOMER':

            if warranty.job_card.customer.user != request.user:

                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view this warranty."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        elif request.user.role not in ['ADMIN', 'STAFF']:

            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to view this warranty."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WarrantySerializer(warranty)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class WarrantyStatusUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        if request.user.role != 'ADMIN':

            return Response(
                {
                    "detail": (
                        "Only Admin can update warranty status."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        warranty = get_object_or_404(
            Warranty,
            id=pk
        )

        serializer = WarrantyStatusSerializer(
            data=request.data
        )

        if serializer.is_valid():

            warranty.status = serializer.validated_data['status']

            warranty.save(
                update_fields=[
                    'status',
                    'updated_at'
                ]
            )

            return Response(
                WarrantySerializer(warranty).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# =====================================================
# Public Job Card Tracking API
# =====================================================

class PublicJobCardTrackingView(APIView):
    """
    Public API for customers to track repair status
    using the unique tracking token.

    Login is NOT required.
    """

    permission_classes = [AllowAny]

    def get(self, request, tracking_token):

        job_card = get_object_or_404(
            JobCard.objects.select_related(
                'customer',
                'device',
                'technician'
            ),
            tracking_token=tracking_token
        )

        return Response(
            {
                'job_card_number': job_card.job_card_number,
                'device': {
                    'brand': job_card.device.brand,
                    'model': job_card.device.model,
                },
                'status': job_card.status,
                'status_display': job_card.get_status_display(),
                'last_updated': job_card.updated_at,
            },
            status=status.HTTP_200_OK
        )

