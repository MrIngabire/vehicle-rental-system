from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from bookings.models import Booking
from vehicles.models import Vehicle
from accounts.models import User

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class FinancialReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        approved = Booking.objects.filter(status='approved')
        total_revenue = approved.aggregate(total=Sum('total_amount'))['total'] or 0
        today = Booking.objects.filter(status='approved', reviewed_at__date__gte=__import__('datetime').date.today())
        return Response({
            'total_revenue': total_revenue,
            'total_bookings': Booking.objects.count(),
            'approved_bookings': approved.count(),
            'pending_bookings': Booking.objects.filter(status='pending').count(),
            'rejected_bookings': Booking.objects.filter(status='rejected').count(),
            'fleet_total': Vehicle.objects.count(),
            'fleet_available': Vehicle.objects.filter(status='available').count(),
            'fleet_booked': Vehicle.objects.filter(status='booked').count(),
            'fleet_maintenance': Vehicle.objects.filter(status='maintenance').count(),
            'total_users': User.objects.count(),
            'by_category': list(
                Booking.objects.values('requested_category')
                .annotate(count=Count('id')).order_by('-count')
            ),
        })

class ActivityReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        recent = Booking.objects.order_by('-created_at')[:10]
        data = [{
            'reference': b.reference,
            'customer': b.customer.get_full_name() or b.customer.username,
            'vehicle': str(b.vehicle) if b.vehicle else b.requested_unit,
            'status': b.status,
            'created_at': b.created_at,
        } for b in recent]
        return Response({'recent_activity': data})