from rest_framework.permissions import BasePermission


class IsAdminOrStaff(BasePermission):
    """
    Allows access only to ADMIN and STAFF users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'STAFF']
        )


class IsAdminStaffOrOwnCustomer(BasePermission):
    """
    ADMIN and STAFF can access customers.
    CUSTOMER can access only their own customer profile.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'STAFF', 'CUSTOMER']
        )

    def has_object_permission(self, request, view, obj):

        if request.user.role in ['ADMIN', 'STAFF']:
            return True

        return obj.user == request.user

class IsAdminStaffOrOwnDevice(BasePermission):
    """
    ADMIN and STAFF can access all devices.
    CUSTOMER can access only devices belonging to their own customer profile.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'STAFF', 'CUSTOMER']
        )

    def has_object_permission(self, request, view, obj):

        if request.user.role in ['ADMIN', 'STAFF']:
            return True

        return obj.customer.user == request.user