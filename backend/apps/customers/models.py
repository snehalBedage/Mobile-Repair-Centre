from django.conf import settings
from django.db import models


class Customer(models.Model):

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'

    id = models.BigAutoField(primary_key=True)

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_profile'
    )

    customer_code = models.CharField(
        max_length=50,
        unique=True
    )

    name = models.CharField(max_length=100)

    mobile = models.CharField(max_length=20)

    email = models.EmailField(
        max_length=150,
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer_code} - {self.name}"


class Device(models.Model):

    id = models.BigAutoField(primary_key=True)

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='devices'
    )

    brand = models.CharField(max_length=100)

    model = models.CharField(max_length=100)

    imei = models.CharField(
        max_length=20,
        unique=True
    )

    device_condition = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand} {self.model} - {self.imei}"