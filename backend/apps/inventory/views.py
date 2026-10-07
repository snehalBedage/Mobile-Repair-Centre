from django.db import transaction

from rest_framework import generics,status
from rest_framework.response import Response


from .models import SparePart, JobPart
from .serializers import (
    SparePartSerializer,
    StockAddSerializer,
    JobPartSerializer,
    )

from apps.repairs.permissions import IsAdminOrStaff


class SparePartListCreateView(generics.ListCreateAPIView):

    queryset = SparePart.objects.all().order_by('-id')
    serializer_class = SparePartSerializer
    permission_classes = [IsAdminOrStaff]


class SparePartDetailView(generics.RetrieveUpdateAPIView):

    queryset = SparePart.objects.all()
    serializer_class = SparePartSerializer
    permission_classes = [IsAdminOrStaff]


class SparePartAddStockView(generics.GenericAPIView):

    queryset = SparePart.objects.all()
    serializer_class = StockAddSerializer
    permission_classes = [IsAdminOrStaff]

    def post(self, request, *args, **kwargs):

        spare_part = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        added_quantity = serializer.validated_data['quantity']

        previous_quantity = spare_part.quantity

        spare_part.quantity += added_quantity
        spare_part.save()

        return Response(
            {
                'message': 'Stock added successfully.',
                'part_id': spare_part.id,
                'part_name': spare_part.part_name,
                'previous_quantity': previous_quantity,
                'added_quantity': added_quantity,
                'new_quantity': spare_part.quantity,
            },
            status=status.HTTP_200_OK
        )

class JobPartListCreateView(generics.ListCreateAPIView):

    serializer_class = JobPartSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):

        return JobPart.objects.select_related(
            'job_card',
            'spare_part'
        ).all().order_by('-id')

    @transaction.atomic
    def perform_create(self, serializer):

        spare_part_id = serializer.validated_data['spare_part'].id
        quantity = serializer.validated_data['quantity']

        spare_part = SparePart.objects.select_for_update().get(
            id=spare_part_id
        )

        job_card = serializer.validated_data['job_card']

        # Completed / Cancelled Job Card protection
        if job_card.status in [
            'COMPLETED',
            'CANCELLED'
        ]:
            from rest_framework import serializers

            raise serializers.ValidationError({
                'job_card': (
                    'Job Part cannot be added to a '
                    'completed or cancelled Job Card.'
                )
            })

        # Insufficient stock check
        if spare_part.quantity < quantity:

            from rest_framework import serializers

            raise serializers.ValidationError({
                'quantity': (
                    f'Insufficient stock. '
                    f'Available stock: {spare_part.quantity}.'
                )
            })

        unit_price = spare_part.unit_price
        total_price = unit_price * quantity

        # Deduct stock
        spare_part.quantity -= quantity
        spare_part.save(
            update_fields=['quantity', 'updated_at']
        )

        # Create JobPart
        serializer.save(
            unit_price=unit_price,
            total_price=total_price
        )


class JobPartDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = JobPart.objects.select_related(
        'job_card',
        'spare_part'
    ).all()

    serializer_class = JobPartSerializer
    permission_classes = [IsAdminOrStaff]

    @transaction.atomic
    def update(self, request, *args, **kwargs):

        job_part = self.get_object()

        # Completed / Cancelled protection
        if job_part.job_card.status in [
            'COMPLETED',
            'CANCELLED'
        ]:
            return Response(
                {
                    'detail': (
                        'Job Part cannot be updated for a '
                        'completed or cancelled Job Card.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        old_quantity = job_part.quantity

        new_quantity = request.data.get(
            'quantity',
            old_quantity
        )

        try:
            new_quantity = int(new_quantity)

        except (TypeError, ValueError):

            return Response(
                {
                    'quantity': (
                        'Quantity must be a valid number.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_quantity <= 0:

            return Response(
                {
                    'quantity': (
                        'Quantity must be greater than 0.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        spare_part = SparePart.objects.select_for_update().get(
            id=job_part.spare_part_id
        )

        difference = new_quantity - old_quantity

        # Quantity increased
        if difference > 0:

            if spare_part.quantity < difference:

                return Response(
                    {
                        'quantity': (
                            f'Insufficient stock. '
                            f'Available stock: {spare_part.quantity}. '
                            f'Additional quantity required: '
                            f'{difference}.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            spare_part.quantity -= difference

            spare_part.save(
                update_fields=[
                    'quantity',
                    'updated_at'
                ]
            )

        # Quantity decreased
        elif difference < 0:

            returned_quantity = abs(difference)

            spare_part.quantity += returned_quantity

            spare_part.save(
                update_fields=[
                    'quantity',
                    'updated_at'
                ]
            )

        serializer = self.get_serializer(
            job_part,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            unit_price=spare_part.unit_price,
            total_price=(
                spare_part.unit_price * new_quantity
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):

        job_part = self.get_object()

        # Completed / Cancelled protection
        if job_part.job_card.status in [
            'COMPLETED',
            'CANCELLED'
        ]:
            return Response(
                {
                    'detail': (
                        'Job Part cannot be deleted for a '
                        'completed or cancelled Job Card.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        spare_part = SparePart.objects.select_for_update().get(
            id=job_part.spare_part_id
        )

        returned_quantity = job_part.quantity
        job_part_id = job_part.id
        spare_part_id = spare_part.id

        # Return stock
        spare_part.quantity += returned_quantity

        spare_part.save(
            update_fields=[
                'quantity',
                'updated_at'
            ]
        )

        # Delete JobPart
        job_part.delete()

        return Response(
            {
                'message': 'Job Part deleted successfully.',
                'job_part_id': job_part_id,
                'returned_quantity': returned_quantity,
                'spare_part_id': spare_part_id,
                'new_stock_quantity': spare_part.quantity
            },
            status=status.HTTP_200_OK
        )