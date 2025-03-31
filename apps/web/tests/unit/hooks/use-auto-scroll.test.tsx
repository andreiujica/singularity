import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoScroll } from '@/hooks/use-auto-scroll';

describe('useAutoScroll', () => {
  it('should return a ref object', () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(result.current).toHaveProperty('current');
  });

  it('should call scrollIntoView when dependencies change', async () => {
    // Mock scrollIntoView function
    const scrollIntoViewMock = vi.fn();
    
    // Create a mock ref implementation
    const origRefCurrent = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    const { result, rerender } = renderHook(
      (deps) => useAutoScroll(deps),
      { initialProps: [1] }
    );
    
    // Set up the ref with a mock element
    const div = document.createElement('div');
    Object.defineProperty(result.current, 'current', {
      value: div,
      writable: true,
    });
    
    // Trigger dependency change
    rerender([2]);
    
    // Check if scrollIntoView was called with the expected behavior
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
    
    // Restore original implementation
    Element.prototype.scrollIntoView = origRefCurrent;
  });
}); 