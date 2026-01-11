import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    render(<Button title="Test Button" onPress={() => {}} />);

    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    render(<Button title="Press Me" onPress={mockOnPress} />);

    fireEvent.press(screen.getByText('Press Me'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    render(<Button title="Disabled" onPress={mockOnPress} disabled />);

    fireEvent.press(screen.getByText('Disabled'));

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders loading state correctly', () => {
    render(<Button title="Loading" onPress={() => {}} loading />);

    // The button should show ActivityIndicator when loading
    expect(screen.getByTestId('button-loading')).toBeTruthy();
  });

  it('renders outline variant correctly', () => {
    render(<Button title="Outline" onPress={() => {}} variant="outline" />);

    expect(screen.getByText('Outline')).toBeTruthy();
  });

  it('renders secondary variant correctly', () => {
    render(<Button title="Secondary" onPress={() => {}} variant="secondary" />);

    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('applies fullWidth style when prop is true', () => {
    render(<Button title="Full Width" onPress={() => {}} fullWidth />);

    expect(screen.getByText('Full Width')).toBeTruthy();
  });
});
