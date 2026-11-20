from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Vehicle
from .serializers import VehicleSerializer


class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('manager', 'admin')
        )


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by('-created_at')
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]  # ← default for everyone

    def get_permissions(self):
        # Only mutating actions require manager/admin
        if self.action in ('create', 'update', 'partial_update', 'destroy', 'set_status'):
            return [IsManagerOrAdmin()]
        # list / retrieve / available → any authenticated user
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def available(self, request):
        qs = Vehicle.objects.filter(status='available')
        search = request.query_params.get('search', '').strip()
        category = request.query_params.get('category', '').strip()

        if search:
            from django.db.models import Q
            qs = qs.filter(Q(make__icontains=search) | Q(model__icontains=search))

        if category:
            qs = qs.filter(category=category)

        return Response(VehicleSerializer(qs, many=True).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsManagerOrAdmin])
    def set_status(self, request, pk=None):
        vehicle = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Vehicle.STATUS_CHOICES):
            vehicle.status = new_status
            vehicle.save()
            return Response(VehicleSerializer(vehicle).data)
        return Response({'error': 'Invalid status'}, status=400)