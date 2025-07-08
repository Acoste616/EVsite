import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  User: () => <div data-testid="user-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
}));

const defaultProps = {
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: jest.fn(),
  user: null,
  userRole: null,
  cartItemCount: 0,
  navigate: jest.fn(),
  handleLogout: jest.fn(),
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header with logo and navigation', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByAltText('EV-Shop Logo')).toBeInTheDocument();
    expect(screen.getByText('Ładowarki')).toBeInTheDocument();
    expect(screen.getByText('Adaptery')).toBeInTheDocument();
    expect(screen.getByText('Akcesoria')).toBeInTheDocument();
    expect(screen.getByText('Baterie')).toBeInTheDocument();
  });

  it('should navigate to home when logo is clicked', () => {
    const navigate = jest.fn();
    render(<Header {...defaultProps} navigate={navigate} />);

    fireEvent.click(screen.getByAltText('EV-Shop Logo'));

    expect(navigate).toHaveBeenCalledWith('home');
  });

  it('should navigate to category when navigation item is clicked', () => {
    const navigate = jest.fn();
    render(<Header {...defaultProps} navigate={navigate} />);

    fireEvent.click(screen.getByText('Ładowarki'));

    expect(navigate).toHaveBeenCalledWith('category', 'Ładowarki');
  });

  it('should navigate to cart when cart icon is clicked', () => {
    const navigate = jest.fn();
    render(<Header {...defaultProps} navigate={navigate} />);

    fireEvent.click(screen.getByTestId('shopping-cart-icon').parentElement);

    expect(navigate).toHaveBeenCalledWith('cart');
  });

  it('should show cart item count when items are in cart', () => {
    render(<Header {...defaultProps} cartItemCount={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not show cart count when cart is empty', () => {
    render(<Header {...defaultProps} cartItemCount={0} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should show login/register options when user is not logged in', () => {
    render(<Header {...defaultProps} />);

    // User icon should be present for login
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('should show user menu when user is logged in', () => {
    const user = { email: 'test@example.com' };
    render(<Header {...defaultProps} user={user} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should show admin panel option for admin users', () => {
    const user = { email: 'admin@example.com' };
    render(<Header {...defaultProps} user={user} userRole="admin" />);

    expect(screen.getByText('Panel Admina')).toBeInTheDocument();
  });

  it('should not show admin panel option for regular users', () => {
    const user = { email: 'user@example.com' };
    render(<Header {...defaultProps} user={user} userRole="user" />);

    expect(screen.queryByText('Panel Admina')).not.toBeInTheDocument();
  });

  it('should call handleLogout when logout is clicked', () => {
    const handleLogout = jest.fn();
    const user = { email: 'test@example.com' };

    render(
      <Header {...defaultProps} user={user} handleLogout={handleLogout} />
    );

    fireEvent.click(screen.getByText('Wyloguj'));

    expect(handleLogout).toHaveBeenCalled();
  });

  it('should navigate to admin panel when admin link is clicked', () => {
    const navigate = jest.fn();
    const user = { email: 'admin@example.com' };

    render(
      <Header
        {...defaultProps}
        user={user}
        userRole="admin"
        navigate={navigate}
      />
    );

    fireEvent.click(screen.getByText('Panel Admina'));

    expect(navigate).toHaveBeenCalledWith('admin');
  });

  it('should toggle mobile menu when menu button is clicked', () => {
    const setIsMobileMenuOpen = jest.fn();

    render(
      <Header {...defaultProps} setIsMobileMenuOpen={setIsMobileMenuOpen} />
    );

    fireEvent.click(screen.getByTestId('menu-icon').parentElement);

    expect(setIsMobileMenuOpen).toHaveBeenCalledWith(true);
  });

  it('should show X icon when mobile menu is open', () => {
    render(<Header {...defaultProps} isMobileMenuOpen={true} />);

    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('menu-icon')).not.toBeInTheDocument();
  });

  it('should navigate to login when user icon is clicked and user is not logged in', () => {
    const navigate = jest.fn();

    render(<Header {...defaultProps} navigate={navigate} />);

    fireEvent.click(screen.getByTestId('user-icon').parentElement);

    expect(navigate).toHaveBeenCalledWith('login');
  });

  it('should not navigate when user icon is clicked and user is logged in', () => {
    const navigate = jest.fn();
    const user = { email: 'test@example.com' };

    render(<Header {...defaultProps} user={user} navigate={navigate} />);

    fireEvent.click(screen.getByTestId('user-icon').parentElement);

    expect(navigate).not.toHaveBeenCalled();
  });
});
