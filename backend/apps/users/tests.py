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
        self.register_url = reverse('api:users:register')
        self.login_url = reverse('api:users:login')
        self.logout_url = reverse('api:users:logout')
        self.user_url = reverse('api:users:user')
        self.users_url = reverse('api:users:users')

        refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(refresh)
        self.access_token = str(refresh.access_token)
        self.authenticated_client = APIClient()
        self.authenticated_client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_register_user(self):
        data = {
            'username': 'john',
            'email': 'john@beatles.com',
            'password': 'j0hnL3nn0n',
            'password2': 'j0hnL3nn0n',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_user_passwords_not_matching(self):
        data = {
            'username': 'john',
            'email': 'john@beatles.com',
            'password': 'j0hnL3nn0n',
            'password2': 'paulMcC@rtn3yy',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Password fields do not match.', str(response.data['password'][0]))

    def test_user_login(self):
        data = {
            'username': 'dered',
            'password': 'dered1234'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], self.user.username)

    def test_user_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }

        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {'error': 'Invalid credentials'})

    def test_get_user_authenticated(self):
        response = self.authenticated_client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)

    def test_get_user_unauthenticated(self):
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Authentication credentials were not provided.', str(response.data['detail']))

    def test_update_user(self):
        response = self.authenticated_client.put(self.user_url, {'email': 'testing@test.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testing@test.com')
        self.user.refresh_from_db()  # verify db
        self.assertEqual(self.user.email, 'testing@test.com')

    def test_user_logout(self):
        response = self.authenticated_client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['msg'], 'Successfully logged out.')

    def test_get_users(self):
        data = {
            'username': 'john',
            'email': 'john@beatles.com',
            'password': 'j0hnLennon',
            'password2': 'j0hnLennon',
        }
        data2 = {
            'username': 'paul',
            'email': 'paul@beatles.com',
            'password': 'paulMCCCCCC',
            'password2': 'paulMCCCCCC',
        }
        data3 = {
            'username': 'george',
            'email': 'george@beatles.com',
            'password': 'g30rg333',
            'password2': 'g30rg333',
        }
        data4 = {
            'username': 'ringo',
            'email': 'ringo@beatles.com',
            'password': 'r!!!!!!ngo--00',
            'password2': 'r!!!!!!ngo--00',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(self.register_url, data2, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(self.register_url, data3, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(self.register_url, data4, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.client.login(username=self.user.username, password='dered1234')
        response = self.authenticated_client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

    def test_delete_user(self):
        response = self.authenticated_client.delete(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data['msg'], 'Successfully deleted user.')
        self.assertFalse(
            User.objects.filter(id=self.user.id).exists()
        )  # verify db
