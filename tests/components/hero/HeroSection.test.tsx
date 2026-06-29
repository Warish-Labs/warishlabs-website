import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock Three.js and R3F fiber completely since they cannot run in JSDOM environment
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({ pointer: { x: 0, y: 0 }, gl: { dispose: vi.fn() }, scene: { traverse: vi.fn() } }),
}));
vi.mock('@react-three/drei', () => ({
  Edges: () => null,
  Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/hero/HeroCanvas', () => {
  return {
    default: () => <div data-testid="hero-canvas" />
  };
});
vi.mock('./HeroCanvas', () => {
  return {
    default: () => <div data-testid="hero-canvas" />
  };
});

import HeroSection from '@/components/hero/HeroSection';

describe('HeroSection', () => {
  it('renders title and description details correctly', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders primary explore button', () => {
    render(<HeroSection />);
    expect(screen.getByRole('link', { name: /explore products/i })).toBeInTheDocument();
  });
});
