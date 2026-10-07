from rest_framework import serializers

from .models import Technician


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