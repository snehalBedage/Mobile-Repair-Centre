from rest_framework.permissions import BasePermission


class IsAdminOrStaff(BasePermission):
    """
    ADMIN and STAFF can access technician management.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'STAFF']
        )


class IsAdminOnly(BasePermission):
    """
    Only ADMIN can perform administrative technician actions.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )
    