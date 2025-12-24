from rest_framework import serializers
from .models import POI


class POISerializer(serializers.ModelSerializer):
    # include the username of the creator
    created_by_username = serializers.CharField(
        source='created_by.username',
        read_only=True
    )

    class Meta:
        model = POI
        fields = [
            'id',
            'name',
            'description',
            'latitude',
            'longitude',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_username', 'created_by']

    def validate_latitude(self, value):
        """Ensure latitude is between -90 and 90 degrees"""
        if value < -90 or value > 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90 degrees.")
        return value

    def validate_longitude(self, value):
        """Ensure longitude is between -180 and 180 degrees"""
        if value < -180 or value > 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180 degrees.")
        return value
