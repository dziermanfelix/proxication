from rest_framework.test import APIClient
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

User = get_user_model()


class UsersTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dered', email='dered@dered.com', password='dered1234')
        self.user_id = self.user.id
        self.register_url = reverse('api:users:register')
        self.login_url = reverse('api:users:login')
        self.logout_url = reverse('api:users:logout')
        self.user_url = reverse('api:users:user')
        self.users_url = reverse('api:users:users')

        self.pois_url = reverse('api:pois:pois')
        self.poi_url = reverse('api:pois')

        refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(refresh)
        self.access_token = str(refresh.access_token)
        self.authenticated_client = APIClient()
        self.authenticated_client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_post_poi(self):
        data = {
            'name': 'something cool',
            'description': 'this is something cool',
            'latitude': 0,
            'longitude': 0,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_read_poi(self):
        data = {
            'name': 'another place',
            'description': 'this is a place in addition to another place',
            'latitude': 90,
            'longitude': 180,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.get(f'{self.poi_url}/1')
        print(response.data)
