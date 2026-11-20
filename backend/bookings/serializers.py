from rest_framework import serializers
from .models import Booking
from vehicles.serializers import VehicleSerializer
from accounts.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source='customer', read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    days = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['reference', 'customer', 'status', 'manager_feedback',
                            'reviewed_by', 'reviewed_at', 'total_amount', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['customer'] = request.user
        # Auto-assign vehicle if specific unit matches
        unit = validated_data.get('requested_unit', '')
        if unit:
            from vehicles.models import Vehicle
            v = Vehicle.objects.filter(model__icontains=unit.split()[-1]).first()
            if v:
                validated_data['vehicle'] = v
                validated_data['total_amount'] = v.daily_rate * max(
                    (validated_data['return_date'] - validated_data['pickup_date']).days, 1
                )
        return super().create(validated_data)