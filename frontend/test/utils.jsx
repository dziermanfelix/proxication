import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import Home from '../src/pages/Home';

const pages = {
  login: Login,
  register: Register,
  home: Home,
};

export function goTo(pageName) {
  const Page = pages[pageName];
  if (!Page) {
    throw new Error(`Unknown page: ${pageName}. Available: ${Object.keys(pages).join(', ')}`);
  }

  return render(
    <MemoryRouter initialEntries={[`/${pageName}`]}>
      <AuthProvider>
        <Page />
      </AuthProvider>
    </MemoryRouter>
  );
}
