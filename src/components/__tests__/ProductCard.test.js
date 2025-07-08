import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, ...props }) => (
      <div onClick={onClick} className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Star: ({ className }) => (
    <div data-testid="star-icon" className={className} />
  ),
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'This is a test product description',
  price: 299,
  rating: 4.5,
  imageUrls: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
  bestseller: false,
};

const mockProductBestseller = {
  ...mockProduct,
  bestseller: true,
};

const defaultProps = {
  product: mockProduct,
  navigate: jest.fn(),
  addToCart: jest.fn(),
};

describe('ProductCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product information correctly', () => {
    render(<ProductCard {...defaultProps} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test product description')
    ).toBeInTheDocument();
    expect(screen.getByText('299 zł')).toBeInTheDocument();
    expect(screen.getByText('(4.5)')).toBeInTheDocument();
  });

  it('should display product image with correct src and alt', () => {
    render(<ProductCard {...defaultProps} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
  });

  it('should use default image when product has no imageUrls', () => {
    const productWithoutImages = { ...mockProduct, imageUrls: [] };
    render(<ProductCard {...defaultProps} product={productWithoutImages} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', '/default-product.png');
  });

  it('should show bestseller badge when product is bestseller', () => {
    render(<ProductCard {...defaultProps} product={mockProductBestseller} />);

    expect(screen.getByText('Bestseller')).toBeInTheDocument();
  });

  it('should not show bestseller badge when product is not bestseller', () => {
    render(<ProductCard {...defaultProps} />);

    expect(screen.queryByText('Bestseller')).not.toBeInTheDocument();
  });

  it('should navigate to product page when card is clicked', () => {
    const navigate = jest.fn();
    render(<ProductCard {...defaultProps} navigate={navigate} />);

    fireEvent.click(screen.getByText('Test Product').closest('div'));

    expect(navigate).toHaveBeenCalledWith('product', '1');
  });

  it('should add product to cart when add to cart button is clicked', () => {
    const addToCart = jest.fn();
    render(<ProductCard {...defaultProps} addToCart={addToCart} />);

    fireEvent.click(screen.getByText('Dodaj do koszyka'));

    expect(addToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('should prevent navigation when add to cart button is clicked', () => {
    const navigate = jest.fn();
    const addToCart = jest.fn();

    render(
      <ProductCard
        {...defaultProps}
        navigate={navigate}
        addToCart={addToCart}
      />
    );

    fireEvent.click(screen.getByText('Dodaj do koszyka'));

    expect(addToCart).toHaveBeenCalledWith(mockProduct);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should display correct number of stars based on rating', () => {
    render(<ProductCard {...defaultProps} />);

    const stars = screen.getAllByTestId('star-icon');
    expect(stars).toHaveLength(5);

    // Check if first 4 stars have filled styling (rating is 4.5)
    const filledStars = stars.filter(star =>
      star.className.includes('text-yellow-400')
    );
    const emptyStars = stars.filter(star =>
      star.className.includes('text-gray-400')
    );

    expect(filledStars).toHaveLength(4);
    expect(emptyStars).toHaveLength(1);
  });

  it('should format price correctly with Polish locale', () => {
    const expensiveProduct = { ...mockProduct, price: 1299.99 };
    render(<ProductCard {...defaultProps} product={expensiveProduct} />);

    expect(screen.getByText('1 300 zł')).toBeInTheDocument();
  });

  it('should handle image loading error by showing default image', () => {
    render(<ProductCard {...defaultProps} />);

    const image = screen.getByAltText('Test Product');

    // Simulate image error
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', '/default-product.png');
  });

  it('should truncate long product descriptions', () => {
    const longDescriptionProduct = {
      ...mockProduct,
      description:
        'This is a very long product description that should be truncated because it exceeds the normal length limit for product cards and we want to maintain consistent layout',
    };

    render(<ProductCard {...defaultProps} product={longDescriptionProduct} />);

    const description = screen.getByText(longDescriptionProduct.description);
    expect(description).toHaveClass('line-clamp-2');
  });

  it('should have proper accessibility attributes', () => {
    render(<ProductCard {...defaultProps} />);

    const button = screen.getByText('Dodaj do koszyka');
    expect(button).toHaveAttribute('type', 'button');

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('alt', 'Test Product');
  });
});
