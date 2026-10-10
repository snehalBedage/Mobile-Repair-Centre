
from django.conf import settings
from django.db import models


class Technician(models.Model):

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'

    id = models.BigAutoField(primary_key=True)

    name = models.CharField(max_length=100)

    mobile = models.CharField(max_length=20)

    email = models.EmailField(
        max_length=150,
        blank=True,
        null=True
    )

    specialization = models.CharField(max_length=150)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    def __str__(self):
        return self.name


class JobCard(models.Model):

    class Status(models.TextChoices):
        RECEIVED = 'RECEIVED', 'Received'
        DIAGNOSIS = 'DIAGNOSIS', 'Diagnosis'
        ESTIMATE_PREPARED = 'ESTIMATE_PREPARED', 'Estimate Prepared'
        WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL', 'Waiting for Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        REPAIR_IN_PROGRESS = 'REPAIR_IN_PROGRESS', 'Repair in Progress'
        QC = 'QC', 'Quality Check'
        QC_FAILED = 'QC_FAILED', 'QC Failed'
        REPAIR_REQUIRED = 'REPAIR_REQUIRED', 'Repair Required'
        READY_FOR_DELIVERY = 'READY_FOR_DELIVERY', 'Ready for Delivery'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    id = models.BigAutoField(primary_key=True)

    job_card_number = models.CharField(
        max_length=50,
        unique=True
    )

    tracking_token = models.CharField(
        max_length=100,
        unique=True
    )

    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.PROTECT,
        related_name='job_cards'
    )

    device = models.ForeignKey(
        'customers.Device',
        on_delete=models.PROTECT,
        related_name='job_cards'
    )

    technician = models.ForeignKey(
        Technician,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='job_cards'
    )

    reported_problem = models.TextField()

    diagnosis = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.RECEIVED
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    intake_date = models.DateTimeField()

    completed_date = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.job_card_number


class Estimate(models.Model):

    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.BigAutoField(primary_key=True)

    job_card = models.ForeignKey(
        JobCard,
        on_delete=models.CASCADE,
        related_name='estimates'
    )

    service_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    parts_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING
    )

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_estimates'
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Estimate - {self.job_card.job_card_number}"


class StatusHistory(models.Model):

    id = models.BigAutoField(primary_key=True)

    job_card = models.ForeignKey(
        JobCard,
        on_delete=models.CASCADE,
        related_name='status_history'
    )

    status = models.CharField(max_length=30)

    remarks = models.TextField(
        blank=True,
        null=True
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='status_changes'
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_card.job_card_number} - {self.status}"


class Warranty(models.Model):

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
        VOID = 'VOID', 'Void'

    id = models.BigAutoField(primary_key=True)

    job_card = models.OneToOneField(
        JobCard,
        on_delete=models.CASCADE,
        related_name='warranty'
    )

    warranty_number = models.CharField(
        max_length=50,
        unique=True
    )

    start_date = models.DateField()

    end_date = models.DateField()

    warranty_terms = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.warranty_number

