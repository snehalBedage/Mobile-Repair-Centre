from rest_framework import generics

from .models import Customer, Device
from .serializers import CustomerSerializer, DeviceSerializer
from .permissions import (
    IsAdminOrStaff,
    IsAdminStaffOrOwnCustomer,
    IsAdminStaffOrOwnDevice,
)


class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return Customer.objects.all()

        return Customer.objects.filter(user=user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrStaff()]

        return [IsAdminStaffOrOwnCustomer()]


class CustomerDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return Customer.objects.all()

        return Customer.objects.filter(user=user)

    def get_permissions(self):
        return [IsAdminStaffOrOwnCustomer()]

class DeviceListCreateView(generics.ListCreateAPIView):
    serializer_class = DeviceSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return Device.objects.select_related('customer', 'customer__user').all()

        return Device.objects.filter(
            customer__user=user
        ).select_related('customer', 'customer__user')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrStaff()]

        return [IsAdminStaffOrOwnDevice()]


class DeviceDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [IsAdminStaffOrOwnDevice]

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return Device.objects.select_related('customer', 'customer__user').all()

        return Device.objects.filter(
            customer__user=user
        ).select_related('customer', 'customer__user')