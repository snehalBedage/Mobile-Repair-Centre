from django.conf import settings
from django.db import models


class AuditLog(models.Model):

    id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='audit_logs'
    )

    action = models.CharField(
        max_length=100
    )

    table_name = models.CharField(
        max_length=100
    )

    record_id = models.BigIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.email} - {self.action}"