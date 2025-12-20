from django.urls import path
from . import views

app_name = 'pois'

urlpatterns = [
    path('', views.POIsView.as_view(), name='pois'),
    path('<int:pk>/', views.POIView.as_view(), name='poi'),
]
