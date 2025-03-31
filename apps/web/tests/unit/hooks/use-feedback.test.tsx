import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeedback } from '@/hooks/use-feedback';

describe('useFeedback', () => {
  beforeEach(() => {
    // Setup fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  it('should initialize with null feedback and false animating', () => {
    const { result } = renderHook(() => useFeedback());
    
    expect(result.current.feedback).toBeNull();
    expect(result.current.animating).toBe(false);
  });

  it('should set feedback and trigger animation when handleFeedback is called', () => {
    const { result } = renderHook(() => useFeedback());
    
    // Trigger feedback
    act(() => {
      result.current.handleFeedback('up');
    });
    
    // Verify feedback is set and animation started
    expect(result.current.feedback).toBe('up');
    expect(result.current.animating).toBe(true);
    
    // Fast-forward timer
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Animation should be complete
    expect(result.current.animating).toBe(false);
    // Feedback value should remain
    expect(result.current.feedback).toBe('up');
  });

  it('should toggle feedback off when clicking the same type twice', () => {
    const { result } = renderHook(() => useFeedback());
    
    // Set initial feedback to 'up'
    act(() => {
      result.current.handleFeedback('up');
    });
    
    expect(result.current.feedback).toBe('up');
    
    // Complete animation
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Click 'up' again to toggle off
    act(() => {
      result.current.handleFeedback('up');
    });
    
    expect(result.current.feedback).toBeNull();
  });

  it('should change feedback when clicking a different type', () => {
    const { result } = renderHook(() => useFeedback());
    
    // Set initial feedback to 'up'
    act(() => {
      result.current.handleFeedback('up');
    });
    
    expect(result.current.feedback).toBe('up');
    
    // Complete animation
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Click 'down' to change feedback
    act(() => {
      result.current.handleFeedback('down');
    });
    
    expect(result.current.feedback).toBe('down');
  });
}); 