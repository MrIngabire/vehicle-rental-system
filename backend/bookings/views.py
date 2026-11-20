from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Booking
from .serializers import BookingSerializer

class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['manager', 'admin']

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Booking.objects.filter(customer=user).order_by('-created_at')
        return Booking.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action in ['approve', 'reject', 'pending']:
            return [IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[IsManagerOrAdmin])
    def pending(self, request):
        qs = Booking.objects.filter(status='pending').order_by('created_at')
        return Response(BookingSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsManagerOrAdmin])
    def approve(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'approved'
        booking.manager_feedback = request.data.get('feedback', '')
        booking.reviewed_by = request.user
        booking.reviewed_at = timezone.now()
        if booking.vehicle:
            booking.vehicle.status = 'booked'
            booking.vehicle.save()
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsManagerOrAdmin])
    def reject(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'rejected'
        booking.manager_feedback = request.data.get('feedback', '')
        booking.reviewed_by = request.user
        booking.reviewed_at = timezone.now()
        booking.save()
        return Response(BookingSerializer(booking).data)