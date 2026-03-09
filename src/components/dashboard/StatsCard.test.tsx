import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { Users } from 'lucide-react';

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Test Title" value={42} icon={Users} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatsCard title="T" value={1} icon={Users} description="Some desc" />);
    expect(screen.getByText('Some desc')).toBeInTheDocument();
  });

  it('renders trend when provided', () => {
    render(<StatsCard title="T" value={1} icon={Users} trend={{ value: 12, isPositive: true }} />);
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatsCard title="T" value="87%" icon={Users} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });
});
