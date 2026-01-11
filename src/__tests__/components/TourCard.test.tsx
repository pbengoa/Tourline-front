import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { TourCard } from '../../components/TourCard';
import { mockTour } from '../utils/test-utils';

describe('TourCard Component', () => {
  const defaultProps = {
    tour: mockTour,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tour title correctly', () => {
    render(<TourCard {...defaultProps} />);

    expect(screen.getByText('Test Tour')).toBeTruthy();
  });

  it('renders tour price', () => {
    render(<TourCard {...defaultProps} />);

    expect(screen.getByText(/45€/)).toBeTruthy();
  });

  it('renders tour duration', () => {
    render(<TourCard {...defaultProps} />);

    expect(screen.getByText(/3 horas/)).toBeTruthy();
  });

  it('renders tour rating', () => {
    render(<TourCard {...defaultProps} />);

    expect(screen.getByText(/4.9/)).toBeTruthy();
  });

  it('renders tour location', () => {
    render(<TourCard {...defaultProps} />);

    expect(screen.getByText(/Madrid/)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    render(<TourCard {...defaultProps} />);

    const card = screen.getByText('Test Tour');
    fireEvent.press(card);

    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });
});
