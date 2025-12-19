from django.urls import path, include
from . import views

app_name = 'api'

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('users/', include('apps.users.urls', namespace='apps.users')),
]
