import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomeScreen } from '../../screens/HomeScreen';
import { createMockNavigation, createMockRoute } from '../utils/test-utils';

// Mock the navigation
const mockNavigation = createMockNavigation();
const mockRoute = createMockRoute({});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('HomeScreen', () => {
  const defaultProps = {
    navigation: mockNavigation as any,
    route: mockRoute as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header correctly', () => {
    render(<HomeScreen {...defaultProps} />);

    expect(screen.getByText('Tourline')).toBeTruthy();
  });

  it('renders the search bar placeholder', () => {
    render(<HomeScreen {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Buscar guías/i)).toBeTruthy();
  });

  it('renders categories section', () => {
    render(<HomeScreen {...defaultProps} />);

    expect(screen.getByText('Categorías')).toBeTruthy();
  });

  it('renders featured tours section', () => {
    render(<HomeScreen {...defaultProps} />);

    expect(screen.getByText('Tours Destacados')).toBeTruthy();
  });

  it('renders popular guides section', () => {
    render(<HomeScreen {...defaultProps} />);

    expect(screen.getByText('Guías Populares')).toBeTruthy();
  });

  it('renders category pills', () => {
    render(<HomeScreen {...defaultProps} />);

    // Check for at least one category
    expect(screen.getByText('Cultural')).toBeTruthy();
  });
});
