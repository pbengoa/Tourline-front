import { renderHook, act } from '@testing-library/react-native';
import { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('useDebounce hook', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'changed', delay: 500 });

      // Value should still be initial before delay
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Now value should be changed
      expect(result.current).toBe('changed');
    });

    it('should cancel previous timeout on new value', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      // Change value multiple times
      rerender({ value: 'first', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(200);
      });

      rerender({ value: 'second', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(200);
      });

      rerender({ value: 'third', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should only have the final value
      expect(result.current).toBe('third');
    });
  });

  describe('useDebouncedCallback hook', () => {
    it('should debounce callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      // Call debounced function
      result.current();
      expect(callback).not.toHaveBeenCalled();

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should only execute once for multiple rapid calls', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      // Call debounced function multiple times
      result.current();
      result.current();
      result.current();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to callback', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      result.current('arg1', 'arg2');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});

