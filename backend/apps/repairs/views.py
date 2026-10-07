from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.response import Response

from .models import Technician, JobCard, StatusHistory, Estimate

from .serializers import (
    TechnicianSerializer,
    TechnicianStatusSerializer,
    JobCardSerializer,
    JobCardStatusUpdateSerializer,
    StatusHistorySerializer,
    EstimateSerializer,
EstimateApprovalSerializer,
)

from .permissions import (
    IsAdminOrStaff,
     IsAdminOnly,
    IsAdminStaffOrOwnJobCard,
    IsCustomer,
)


# =========================================================
# Technician APIs
# =========================================================

class TechnicianListCreateView(generics.ListCreateAPIView):

    queryset = Technician.objects.all()

    serializer_class = TechnicianSerializer

    permission_classes = [IsAdminOrStaff]

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

class JobCardListCreateView(generics.ListCreateAPIView):

    serializer_class = JobCardSerializer

    def get_queryset(self):

        user = self.request.user

        # ADMIN and STAFF
        if user.role in ['ADMIN', 'STAFF']:

            return JobCard.objects.select_related(
                'customer',
                'customer__user',
                'device',
                'technician'
            ).all()

        # CUSTOMER
        return JobCard.objects.filter(
            customer__user=user
        ).select_related(
            'customer',
            'customer__user',
            'device',
            'technician'
        )

    def get_permissions(self):

        # Only ADMIN and STAFF can create Job Cards
        if self.request.method == 'POST':

            return [
                IsAdminOrStaff()
            ]

        # GET can be used by ADMIN, STAFF and CUSTOMER
        return [
            IsAdminStaffOrOwnJobCard()
        ]


class JobCardDetailView(generics.RetrieveUpdateAPIView):

    serializer_class = JobCardSerializer

    permission_classes = [
        IsAdminStaffOrOwnJobCard
    ]

    def get_queryset(self):

        user = self.request.user

        # ADMIN and STAFF
        if user.role in ['ADMIN', 'STAFF']:

            return JobCard.objects.select_related(
                'customer',
                'customer__user',
                'device',
                'technician'
            ).all()

        # CUSTOMER
        return JobCard.objects.filter(
            customer__user=user
        ).select_related(
            'customer',
            'customer__user',
            'device',
            'technician'
        )


# =========================================================
# Job Card Status Update API
# =========================================================

class JobCardStatusUpdateView(generics.UpdateAPIView):

    queryset = JobCard.objects.all()

    serializer_class = JobCardStatusUpdateSerializer

    permission_classes = [
        IsAdminOrStaff
    ]

    def update(self, request, *args, **kwargs):

        job_card = self.get_object()

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        new_status = serializer.validated_data[
            'status'
        ]

        remarks = serializer.validated_data.get(
            'remarks',
            ''
        )

        old_status = job_card.status

        # -------------------------------------------------
        # Same Status Check
        # -------------------------------------------------

        if old_status == new_status:

            return Response(
                {
                    'detail':
                        'Job Card is already in this status.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Completed Date Handling
        # -------------------------------------------------

        if new_status == JobCard.Status.COMPLETED:

            job_card.completed_date = timezone.now()

        elif old_status == JobCard.Status.COMPLETED:

            job_card.completed_date = None

        # -------------------------------------------------
        # Update Status
        # -------------------------------------------------

        job_card.status = new_status

        job_card.save()

        # -------------------------------------------------
        # Create Status History
        # -------------------------------------------------

        StatusHistory.objects.create(
            job_card=job_card,
            status=new_status,
            remarks=remarks,
            changed_by=request.user
        )

        # -------------------------------------------------
        # Response
        # -------------------------------------------------

        return Response(
            {
                'message':
                    'Job Card status updated successfully.',

                'job_card_id':
                    job_card.id,

                'job_card_number':
                    job_card.job_card_number,

                'old_status':
                    old_status,

                'new_status':
                    new_status,

                'remarks':
                    remarks,

                'completed_date':
                    job_card.completed_date,
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

        if user.role in ['ADMIN', 'STAFF']:
            return Estimate.objects.select_related(
                'job_card',
                'job_card__customer',
                'job_card__device',
                'approved_by'
            ).all()

        return Estimate.objects.filter(
            job_card__customer__user=user
        ).select_related(
            'job_card',
            'job_card__customer',
            'job_card__device',
            'approved_by'
        )

    def get_permissions(self):

        if self.request.method == 'POST':
            return [IsAdminOrStaff()]

        return [IsAdminStaffOrOwnJobCard()]

# Estimate Detail View
class EstimateDetailView(generics.RetrieveUpdateAPIView):

    serializer_class = EstimateSerializer
    permission_classes = [IsAdminStaffOrOwnJobCard]

    def get_queryset(self):

        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return Estimate.objects.select_related(
                'job_card',
                'job_card__customer',
                'job_card__device',
                'approved_by'
            ).all()

        return Estimate.objects.filter(
            job_card__customer__user=user
        ).select_related(
            'job_card',
            'job_card__customer',
            'job_card__device',
            'approved_by'
        )

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

    def update(self, request, *args, **kwargs):

        estimate = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        approval_status = serializer.validated_data['approval_status']
        remarks = serializer.validated_data.get('remarks', '')

        # Prevent duplicate approval/rejection
        if estimate.approval_status != Estimate.ApprovalStatus.PENDING:
            return Response(
                {
                    'detail': 'This estimate has already been approved or rejected.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update Estimate approval details
        estimate.approval_status = approval_status
        estimate.approved_by = request.user
        estimate.approved_at = timezone.now()
        estimate.save()

        # Update Job Card status
        if approval_status == Estimate.ApprovalStatus.APPROVED:
            new_status = JobCard.Status.APPROVED
        else:
            new_status = JobCard.Status.REJECTED

        estimate.job_card.status = new_status
        estimate.job_card.save()

        # Create Status History entry
        StatusHistory.objects.create(
            job_card=estimate.job_card,
            status=new_status,
            remarks=remarks,
            changed_by=request.user
        )

        return Response(
            {
                'message': f'Estimate {approval_status.lower()} successfully.',
                'estimate_id': estimate.id,
                'job_card_id': estimate.job_card.id,
                'job_card_number': estimate.job_card.job_card_number,
                'approval_status': estimate.approval_status,
                'approved_by': request.user.id,
                'approved_at': estimate.approved_at,
                'job_card_status': estimate.job_card.status,
                'status_history_created': True
            },
            status=status.HTTP_200_OK
        )