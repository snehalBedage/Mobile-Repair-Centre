from .models import AuditLog


def create_audit_log(user, action, table_name, record_id):
    AuditLog.objects.create(
        user=user,
        action=action,
        table_name=table_name,
        record_id=record_id
    )