import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { Users } from 'lucide-react';

describe('StatsCard', () => {
  it('renders title and value', () => {
    const { getByText } = render(<StatsCard title="Test Title" value={42} icon={Users} />);
    expect(getByText('Test Title')).toBeInTheDocument();
    expect(getByText('42')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const { getByText } = render(<StatsCard title="T" value={1} icon={Users} description="Some desc" />);
    expect(getByText('Some desc')).toBeInTheDocument();
  });

  it('renders trend when provided', () => {
    const { getByText } = render(<StatsCard title="T" value={1} icon={Users} trend={{ value: 12, isPositive: true }} />);
    expect(getByText('12%')).toBeInTheDocument();
  });

  it('renders string value', () => {
    const { getByText } = render(<StatsCard title="T" value="87%" icon={Users} />);
    expect(getByText('87%')).toBeInTheDocument();
  });
});
