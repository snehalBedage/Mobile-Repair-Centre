from rest_framework import generics

from .models import Customer
from .serializers import CustomerSerializer
from .permissions import (
    IsAdminOrStaff,
    IsAdminStaffOrOwnCustomer
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