from rest_framework.permissions import BasePermission


# =========================================================
# ADMIN + STAFF Permission
# =========================================================

class IsAdminOrStaff(BasePermission):
    """
    ADMIN and STAFF can access management APIs.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'STAFF']
        )


# =========================================================
# ADMIN Only Permission
# =========================================================

class IsAdminOnly(BasePermission):
    """
    Only ADMIN can perform administrative actions.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


# =========================================================
# ADMIN + STAFF + Own Job Card Permission
# =========================================================

class IsAdminStaffOrOwnJobCard(BasePermission):
    """
    ADMIN and STAFF can access all Job Cards.
    CUSTOMER can access only their own Job Cards.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in [
                'ADMIN',
                'STAFF',
                'CUSTOMER'
            ]
        )

    def has_object_permission(self, request, view, obj):

        # ADMIN and STAFF
        if request.user.role in [
            'ADMIN',
            'STAFF'
        ]:
            return True

        # CUSTOMER
        return obj.customer.user == request.user

class IsCustomer(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'CUSTOMER'
        )