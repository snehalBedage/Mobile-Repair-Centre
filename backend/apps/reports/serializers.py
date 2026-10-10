
from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source='user.email',
        read_only=True
    )

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_name',
            'action',
            'table_name',
            'record_id',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'user_name',
            'created_at',
        ]
