import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConfigAdvisor from './ConfigAdvisor';

describe('ConfigAdvisor Hardware Engine', () => {
  it('should render the empty state initially', () => {
    render(<ConfigAdvisor />);

    expect(screen.getByText(/Awaiting system parameters/i)).toBeInTheDocument();
  });

  it('should generate a suitability score when the user clicks analyze', async () => {
    render(<ConfigAdvisor />);

    const submitBtn = screen.getByText(/Analyse Architecture/i);
    fireEvent.click(submitBtn);

    const scoreTitle = await screen.findByText(/Suitability Index/i, {}, { timeout: 2000 });
    const optimalBadge = await screen.findByText(/Sufficient for 400ms block production/i, {}, { timeout: 2000 });
    

    expect(scoreTitle).toBeInTheDocument();
    expect(optimalBadge).toBeInTheDocument();
  });
});