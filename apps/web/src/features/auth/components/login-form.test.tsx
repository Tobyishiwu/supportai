import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const navigate = vi.fn();
const login = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({ login, user: null, isLoading: false, register: vi.fn(), logout: vi.fn() }),
}));

const { LoginForm } = await import('./login-form');

beforeEach(() => {
  navigate.mockReset();
  login.mockReset();
});

describe('LoginForm', () => {
  it('shows validation errors and does not call login for an empty submit', async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates to the dashboard', async () => {
    login.mockResolvedValueOnce(undefined);
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'password123' });
    });
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: '/dashboard' });
    });
  });

  it('shows a server error message when login rejects and does not navigate', async () => {
    login.mockRejectedValueOnce(new Error('bad credentials'));
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
