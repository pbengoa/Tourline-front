import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { GuideCard } from '../../components/GuideCard';
import { mockGuide } from '../utils/test-utils';

describe('GuideCard Component', () => {
  const defaultProps = {
    guide: mockGuide,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders guide name correctly', () => {
    render(<GuideCard {...defaultProps} />);

    expect(screen.getByText('Test Guide')).toBeTruthy();
  });

  it('renders guide location', () => {
    render(<GuideCard {...defaultProps} />);

    expect(screen.getByText(/Madrid/)).toBeTruthy();
  });

  it('renders guide rating', () => {
    render(<GuideCard {...defaultProps} />);

    expect(screen.getByText(/4.8/)).toBeTruthy();
  });

  it('renders price per hour', () => {
    render(<GuideCard {...defaultProps} />);

    expect(screen.getByText(/30€/)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    render(<GuideCard {...defaultProps} />);

    const card = screen.getByText('Test Guide');
    fireEvent.press(card);

    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('shows verified badge when guide is verified', () => {
    render(<GuideCard {...defaultProps} />);

    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('does not show verified badge when guide is not verified', () => {
    const unverifiedGuide = { ...mockGuide, verified: false };
    render(<GuideCard guide={unverifiedGuide} onPress={jest.fn()} />);

    expect(screen.queryByText('✓')).toBeNull();
  });

  it('renders languages correctly', () => {
    render(<GuideCard {...defaultProps} />);

    expect(screen.getByText('Español')).toBeTruthy();
  });
});
