from django.utils import timezone

from rest_framework import serializers

from .models import Technician, JobCard, StatusHistory,Estimate,Warranty


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

    def get_fields(self):
             fields = super().get_fields()
             fields['intake_date'].required = False
             return fields  
    
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

            if  not diagnosis.strip():

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

                # -------------------------------------------------
        # Create Job Card
        # -------------------------------------------------

               # -------------------------------------------------
        # Set Intake Date Automatically
        # -------------------------------------------------

        validated_data.setdefault(
            'intake_date',
            timezone.now()
        )

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

    job_card_number = serializers.CharField(
        source='job_card.job_card_number',
        read_only=True
    )

    customer_name = serializers.CharField(
        source='job_card.customer.name',
        read_only=True
    )

    device_name = serializers.SerializerMethodField()

    class Meta:
        model = Estimate

        fields = [
            'id',
            'job_card',
            'job_card_number',
            'customer_name',
            'device_name',
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
            'job_card_number',
            'customer_name',
            'device_name',
            'total_amount',
            'approval_status',
            'approved_by',
            'approved_at',
            'created_at',
            'updated_at',
        ]

    def get_device_name(self, obj):
        device = obj.job_card.device
        return f"{device.brand} {device.model}".strip()

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

        job_card = estimate.job_card
        job_card.status = JobCard.Status.WAITING_FOR_APPROVAL
        job_card.save(update_fields=['status', 'updated_at'])

        StatusHistory.objects.create(
            job_card=job_card,
            status=JobCard.Status.WAITING_FOR_APPROVAL,
            remarks='Estimate created; awaiting customer approval.',
            changed_by=self.context['request'].user
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

class WarrantySerializer(serializers.ModelSerializer):

    class Meta:
        model = Warranty

        fields = [
            'id',
            'job_card',
            'warranty_number',
            'start_date',
            'end_date',
            'warranty_terms',
            'status',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'warranty_number',
            'status',
            'created_at',
            'updated_at',
        ]

    def validate_job_card(self, value):

        if value.status != JobCard.Status.COMPLETED:
            raise serializers.ValidationError(
                "Warranty can be created only for a completed Job Card."
            )

        if hasattr(value, 'warranty'):
            raise serializers.ValidationError(
                "Warranty already exists for this Job Card."
            )

        return value

    def validate_start_date(self, value):

        return value

    def validate_end_date(self, value):

        start_date = self.initial_data.get('start_date')

        if start_date:
            from datetime import date

            try:
                parsed_start_date = date.fromisoformat(start_date)
            except ValueError:
                return value

            if value < parsed_start_date:
                raise serializers.ValidationError(
                    "End date cannot be before start date."
                )

        return value

    def validate_warranty_terms(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Warranty terms cannot be empty."
            )

        return value

    def create(self, validated_data):

        import uuid

        last_warranty = Warranty.objects.order_by('-id').first()

        next_number = (
            last_warranty.id + 1
            if last_warranty
            else 1
        )

        warranty_number = f"WR{next_number:05d}"

        return Warranty.objects.create(
            warranty_number=warranty_number,
            status=Warranty.Status.ACTIVE,
            **validated_data
        )


class WarrantyStatusSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=Warranty.Status.choices
    )
