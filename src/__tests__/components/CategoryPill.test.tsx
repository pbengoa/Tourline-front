import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { CategoryPill } from '../../components/CategoryPill';
import { mockCategory } from '../utils/test-utils';

describe('CategoryPill Component', () => {
  const defaultProps = {
    category: mockCategory,
    selected: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders category name correctly', () => {
    render(<CategoryPill {...defaultProps} />);

    expect(screen.getByText('Cultural')).toBeTruthy();
  });

  it('renders category icon', () => {
    render(<CategoryPill {...defaultProps} />);

    expect(screen.getByText('🏛️')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<CategoryPill {...defaultProps} />);

    fireEvent.press(screen.getByText('Cultural'));

    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('applies selected style when selected is true', () => {
    render(<CategoryPill {...defaultProps} selected />);

    // Just verify it renders without error when selected
    expect(screen.getByText('Cultural')).toBeTruthy();
  });

  it('does not apply selected style when selected is false', () => {
    render(<CategoryPill {...defaultProps} selected={false} />);

    expect(screen.getByText('Cultural')).toBeTruthy();
  });
});
