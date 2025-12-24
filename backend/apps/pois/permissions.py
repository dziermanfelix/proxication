from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Allow access **only** to the owner.
    Deny everything for non-owners.
    """

    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user
