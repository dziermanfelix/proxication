from rest_framework.test import APIClient
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from decimal import Decimal

User = get_user_model()


class PoisTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dered', email='dered@dered.com', password='dered1234')
        self.user_id = self.user.id
        refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(refresh)
        self.access_token = str(refresh.access_token)
        self.authenticated_client = APIClient()
        self.authenticated_client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        self.user2 = User.objects.create_user(username='dered2', email='dered2@dered.com', password='dered1234')
        self.user_id2 = self.user2.id
        refresh2 = RefreshToken.for_user(self.user2)
        self.refresh_token2 = str(refresh2)
        self.access_token2 = str(refresh2.access_token)
        self.authenticated_client2 = APIClient()
        self.authenticated_client2.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token2}')

        self.pois_url = reverse('api:pois:pois')

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

    def test_get_pois(self):
        data = {
            'name': 'another place',
            'description': 'this is a place in addition to another place',
            'latitude': 90,
            'longitude': 180,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.authenticated_client.get(self.pois_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        data = {
            'name': 'this place',
            'description': 'that is a rancid song',
            'latitude': 44,
            'longitude': 132,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.authenticated_client.get(self.pois_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # only get pois belonging to the user
        response = self.authenticated_client2.get(self.pois_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class PoiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dered', email='dered@dered.com', password='dered1234')
        self.user_id = self.user.id
        refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(refresh)
        self.access_token = str(refresh.access_token)
        self.authenticated_client = APIClient()
        self.authenticated_client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        self.user2 = User.objects.create_user(username='dered2', email='dered2@dered.com', password='dered1234')
        self.user_id2 = self.user2.id
        refresh2 = RefreshToken.for_user(self.user2)
        self.refresh_token2 = str(refresh2)
        self.access_token2 = str(refresh2.access_token)
        self.authenticated_client2 = APIClient()
        self.authenticated_client2.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token2}')

        self.pois_url = reverse('api:pois:pois')

    def test_get_poi(self):
        data = {
            'name': 'another place',
            'description': 'this is a place in addition to another place',
            'latitude': 90,
            'longitude': 180,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        id = response.data['id']
        response = self.authenticated_client.get(reverse('api:pois:poi', kwargs={'pk': id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(Decimal(response.data['latitude']), Decimal(data['latitude']))
        self.assertEqual(Decimal(response.data['longitude']), Decimal(data['longitude']))
        self.assertEqual(response.data['created_by_username'], self.user.username)

    def test_get_poi_forbidden(self):
        data = {
            'name': 'another place',
            'description': 'this is a place in addition to another place',
            'latitude': 90,
            'longitude': 180,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        id = response.data['id']
        response = self.authenticated_client2.get(reverse('api:pois:poi', kwargs={'pk': id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_poi(self):
        data = {
            'name': 'sweet spot',
            'description': 'a little place to hang',
            'latitude': 45,
            'longitude': -180,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        id = response.data['id']
        response = self.authenticated_client.get(reverse('api:pois:poi', kwargs={'pk': id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(Decimal(response.data['latitude']), Decimal(data['latitude']))
        self.assertEqual(Decimal(response.data['longitude']), Decimal(data['longitude']))
        self.assertEqual(response.data['created_by_username'], self.user.username)

        data['name'] = 'a different name'
        response = self.authenticated_client.put(reverse('api:pois:poi', kwargs={'pk': id}), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(Decimal(response.data['latitude']), Decimal(data['latitude']))
        self.assertEqual(Decimal(response.data['longitude']), Decimal(data['longitude']))
        self.assertEqual(response.data['created_by_username'], self.user.username)

    def test_update_poi_forbidden(self):
        data = {
            'name': 'sweet spot',
            'description': 'a little place to hang',
            'latitude': 45,
            'longitude': -180,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        id = response.data['id']
        response = self.authenticated_client.get(reverse('api:pois:poi', kwargs={'pk': id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(Decimal(response.data['latitude']), Decimal(data['latitude']))
        self.assertEqual(Decimal(response.data['longitude']), Decimal(data['longitude']))
        self.assertEqual(response.data['created_by_username'], self.user.username)

        data['name'] = 'a different name'
        response = self.authenticated_client2.put(reverse('api:pois:poi', kwargs={'pk': id}), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_poi(self):
        data = {
            'name': 'cool',
            'description': 'cool place',
            'latitude': 1,
            'longitude': -1,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        id = response.data['id']
        response = self.authenticated_client.delete(reverse('api:pois:poi', kwargs={'pk': id}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data['msg'], 'POI deleted successfully.')

    def test_delete_poi_forbidden(self):
        data = {
            'name': 'cool',
            'description': 'cool place',
            'latitude': 1,
            'longitude': -1,
            'created_by': self.user_id
        }
        response = self.authenticated_client.post(self.pois_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        id = response.data['id']
        response = self.authenticated_client2.delete(reverse('api:pois:poi', kwargs={'pk': id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
