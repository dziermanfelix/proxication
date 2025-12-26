import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { goTo } from './utils';

describe('Login Page', () => {
  it('should successfully login with real API call', async () => {
    const user = userEvent.setup();
    goTo('login');

    await user.type(screen.getByLabelText('Username'), global.TEST_USER.username);
    await user.type(screen.getByLabelText('Password'), global.TEST_USER.password);
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(
      () => {
        const token = localStorage.getItem('accessToken');
        expect(token).toBeTruthy();
      },
      { timeout: 10000 }
    );
  }, 15000);
});
