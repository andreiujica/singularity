import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
const HelloWorld = () => <div>Hello, world!</div>;

describe('Sanity test', () => {
  it('renders without crashing', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello, world!')).toBeDefined();
  });

  it('performs basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBe(true);
    expect([1, 2, 3]).toHaveLength(3);
    expect({ name: 'test' }).toHaveProperty('name');
  });
}); 