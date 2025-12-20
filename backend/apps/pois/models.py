from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class POI(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='pois'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # Newest first by default
        verbose_name = 'Point of Interest'
        verbose_name_plural = 'Points of Interest'

    def __str__(self):
        return f"{self.name} ({self.latitude}, {self.longitude})"
