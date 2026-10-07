from rest_framework import serializers

from .models import SparePart


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
    