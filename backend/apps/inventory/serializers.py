from rest_framework import serializers

from .models import SparePart,JobPart


class SparePartSerializer(serializers.ModelSerializer):

    class Meta:
        model = SparePart

        fields = [
            'id',
            'part_name',
            'part_code',
            'quantity',
            'unit_price',
            'reorder_level',
            'status',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'status',
            'created_at',
            'updated_at',
        ]

    def validate_part_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Part name cannot be empty."
            )

        return value

    def validate_part_code(self, value):

        value = value.strip().upper()

        if not value:
            raise serializers.ValidationError(
                "Part code cannot be empty."
            )

        return value

    def validate_unit_price(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Unit price cannot be negative."
            )

        return value

    def validate_reorder_level(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Reorder level cannot be negative."
            )

        return value

class StockAddSerializer(serializers.Serializer):

    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Stock quantity must be greater than 0."
            )

        return value

class JobPartSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobPart

        fields = [
            'id',
            'job_card',
            'spare_part',
            'quantity',
            'unit_price',
            'total_price',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'unit_price',
            'total_price',
            'created_at',
        ]

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )

        return value

    def validate_spare_part(self, value):

        if value.status != SparePart.Status.ACTIVE:
            raise serializers.ValidationError(
                "Selected spare part is inactive."
            )

        return value

    def validate(self, attrs):

        from apps.repairs.models import JobCard

        job_card = attrs.get('job_card')

        # For PATCH/PUT, use the existing Job Card
        if self.instance:
            job_card = self.instance.job_card

            # Prevent changing Job Card or Spare Part during update
            if 'job_card' in attrs and attrs['job_card'].id != self.instance.job_card_id:
                raise serializers.ValidationError({
                    'job_card': 'Job Card cannot be changed after Job Part creation.'
                })

            if 'spare_part' in attrs and attrs['spare_part'].id != self.instance.spare_part_id:
                raise serializers.ValidationError({
                    'spare_part': 'Spare Part cannot be changed after Job Part creation.'
                })

        if job_card:
            if job_card.status in [
                JobCard.Status.COMPLETED,
                JobCard.Status.CANCELLED
            ]:
                raise serializers.ValidationError(
                    "Job Part cannot be added or updated for a completed or cancelled Job Card."
                )

        return attrs