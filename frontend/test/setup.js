import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

let backendAvailable = false;
try {
  const response = await fetch('http://localhost:8000/api/health/');
  backendAvailable = response.ok;
} catch {
  backendAvailable = false;
}
if (!backendAvailable) {
  console.error('Backend not available. Exiting.');
  process.exit(1);
}

const API_BASE_URL = 'http://localhost:8000/api';
global.TEST_USER = null;

{
  try {
    global.TEST_USER = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123',
    };

    const response = await fetch(`${API_BASE_URL}/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: global.TEST_USER.username,
        email: global.TEST_USER.email,
        password: global.TEST_USER.password,
        password2: global.TEST_USER.password,
      }),
    });

    if (!response.ok) {
      global.TEST_USER = null;
    }
  } catch {
    global.TEST_USER = null;
  }
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
