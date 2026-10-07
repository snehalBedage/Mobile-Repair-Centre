from django.utils import timezone

from rest_framework import serializers

from .models import Technician, JobCard, StatusHistory,Estimate


# =========================================================
# Technician Serializer
# =========================================================

class TechnicianSerializer(serializers.ModelSerializer):

    class Meta:
        model = Technician

        fields = [
            'id',
            'name',
            'mobile',
            'email',
            'specialization',
            'status',
        ]

        read_only_fields = [
            'id',
            'status',
        ]

    def validate_mobile(self, value):

        if not value.isdigit():
            raise serializers.ValidationError(
                "Mobile number must contain only numbers."
            )

        if len(value) != 10:
            raise serializers.ValidationError(
                "Mobile number must be exactly 10 digits."
            )

        return value

    def validate_name(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Technician name cannot be empty."
            )

        return value.strip()

    def validate_specialization(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Specialization cannot be empty."
            )

        return value.strip()


# =========================================================
# Job Card Serializer
# =========================================================

class JobCardSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobCard

        fields = [
            'id',
            'job_card_number',
            'tracking_token',
            'customer',
            'device',
            'technician',
            'reported_problem',
            'diagnosis',
            'status',
            'priority',
            'intake_date',
            'completed_date',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'job_card_number',
            'tracking_token',
            'created_at',
            'updated_at',
        ]

    def validate(self, attrs):

        customer = attrs.get('customer')
        device = attrs.get('device')
        technician = attrs.get('technician')

        # -------------------------------------------------
        # Customer + Device Validation
        # -------------------------------------------------

        if customer and device:

            if device.customer_id != customer.id:

                raise serializers.ValidationError({
                    'device': (
                        'Selected device does not belong '
                        'to the selected customer.'
                    )
                })

        # -------------------------------------------------
        # Technician Validation
        # -------------------------------------------------

        if technician:

            if technician.status != Technician.Status.ACTIVE:

                raise serializers.ValidationError({
                    'technician': (
                        'Selected technician is inactive '
                        'and cannot be assigned.'
                    )
                })

        # -------------------------------------------------
        # Reported Problem Validation
        # -------------------------------------------------

        reported_problem = attrs.get('reported_problem')

        if reported_problem is not None:

            if not reported_problem.strip():

                raise serializers.ValidationError({
                    'reported_problem': (
                        'Reported problem cannot be empty.'
                    )
                })

            attrs['reported_problem'] = reported_problem.strip()

        # -------------------------------------------------
        # Diagnosis Validation
        # -------------------------------------------------

        diagnosis = attrs.get('diagnosis')

        if diagnosis is not None:

            if diagnosis and not diagnosis.strip():

                raise serializers.ValidationError({
                    'diagnosis': (
                        'Diagnosis cannot contain only spaces.'
                    )
                })

            if diagnosis:
                attrs['diagnosis'] = diagnosis.strip()

        return attrs

    def create(self, validated_data):

        import uuid

        # -------------------------------------------------
        # Generate Job Card Number
        # -------------------------------------------------

        last_job = JobCard.objects.order_by('-id').first()

        if last_job:
            next_number = last_job.id + 1
        else:
            next_number = 1

        job_card_number = f"JC{next_number:05d}"

        # -------------------------------------------------
        # Generate Tracking Token
        # -------------------------------------------------

        tracking_token = uuid.uuid4().hex

        # -------------------------------------------------
        # Create Job Card
        # -------------------------------------------------

        return JobCard.objects.create(
            job_card_number=job_card_number,
            tracking_token=tracking_token,
            **validated_data
        )

    def update(self, instance, validated_data):

        # -------------------------------------------------
        # Completed Date Handling
        # -------------------------------------------------

        new_status = validated_data.get(
            'status',
            instance.status
        )

        if (
            new_status == JobCard.Status.COMPLETED
            and instance.status != JobCard.Status.COMPLETED
        ):
            instance.completed_date = timezone.now()

        elif (
            new_status != JobCard.Status.COMPLETED
            and instance.status == JobCard.Status.COMPLETED
        ):
            instance.completed_date = None

        return super().update(
            instance,
            validated_data
        )


# =========================================================
# Job Card Status Update Serializer
# =========================================================

class JobCardStatusUpdateSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=JobCard.Status.choices
    )

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
        default=''
    )

    def validate_remarks(self, value):

        return value.strip()


# =========================================================
# Status History Serializer
# =========================================================

class StatusHistorySerializer(serializers.ModelSerializer):

    changed_by_name = serializers.CharField(
        source='changed_by.username',
        read_only=True
    )

    class Meta:
        model = StatusHistory

        fields = [
            'id',
            'job_card',
            'status',
            'remarks',
            'changed_by',
            'changed_by_name',
            'changed_at',
        ]

        read_only_fields = [
            'id',
            'changed_by',
            'changed_by_name',
            'changed_at',
        ]

# Technician Status Serializer


class TechnicianStatusSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=Technician.Status.choices
    )

# Estimate Serializer
class EstimateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Estimate

        fields = [
            'id',
            'job_card',
            'service_cost',
            'parts_cost',
            'total_amount',
            'approval_status',
            'approved_by',
            'approved_at',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'total_amount',
            'approval_status',
            'approved_by',
            'approved_at',
            'created_at',
            'updated_at',
        ]

    def validate_service_cost(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Service cost cannot be negative."
            )
        return value

    def validate_parts_cost(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Parts cost cannot be negative."
            )
        return value

    def validate_job_card(self, value):
        if value.status in [
            JobCard.Status.COMPLETED,
            JobCard.Status.CANCELLED
        ]:
            raise serializers.ValidationError(
                "Estimate cannot be created for a completed or cancelled Job Card."
            )

        return value

    def create(self, validated_data):

        service_cost = validated_data.get('service_cost', 0)
        parts_cost = validated_data.get('parts_cost', 0)

        total_amount = service_cost + parts_cost

        estimate = Estimate.objects.create(
            total_amount=total_amount,
            **validated_data
        )

        return estimate

    def update(self, instance, validated_data):

        service_cost = validated_data.get(
            'service_cost',
            instance.service_cost
        )

        parts_cost = validated_data.get(
            'parts_cost',
            instance.parts_cost
        )

        instance.total_amount = service_cost + parts_cost

        return super().update(instance, validated_data)


# Estimate Approval Serializer
class EstimateApprovalSerializer(serializers.Serializer):

    approval_status = serializers.ChoiceField(
        choices=[
            (
                Estimate.ApprovalStatus.APPROVED,
                'Approved'
            ),
            (
                Estimate.ApprovalStatus.REJECTED,
                'Rejected'
            ),
        ]
    )

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
        default=''
    )

    def validate_remarks(self, value):
        return value.strip()

