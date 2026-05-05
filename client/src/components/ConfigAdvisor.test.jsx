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

  it('should mark CPU as critical when cores are below the 16 core minimum', async () => {
    render(<ConfigAdvisor />);

    const cpuInput = screen.getByDisplayValue('16');
    fireEvent.change(cpuInput, { target: { value: '11' } });

    fireEvent.click(screen.getByText(/Analyse Architecture/i));

    const criticalBadge = await screen.findByText(/Insufficient compute parameters/i, {}, { timeout: 2000 });
    expect(criticalBadge).toBeInTheDocument();
  });

  it('should mark CPU as optimal at the 16 core, 2.8 GHz boundary', async () => {
    render(<ConfigAdvisor />);

    const clockInput = screen.getByDisplayValue('3');
    fireEvent.change(clockInput, { target: { value: '2.8' } });

    fireEvent.click(screen.getByText(/Analyse Architecture/i));

    const optimalBadge = await screen.findByText(/Sufficient for 400ms block production/i, {}, { timeout: 2000 });
    expect(optimalBadge).toBeInTheDocument();
  });

  it('should mark CPU as optimal when scaled to recommended 32 cores', async () => {
    render(<ConfigAdvisor />);

    const cpuInput = screen.getByDisplayValue('16');
    fireEvent.change(cpuInput, { target: { value: '32' } });

    fireEvent.click(screen.getByText(/Analyse Architecture/i));

    const optimalBadge = await screen.findByText(/Sufficient for 400ms block production/i, {}, { timeout: 2000 });
    expect(optimalBadge).toBeInTheDocument();
  });

  it('should mark RAM as a warning between the 256 and 512 GB thresholds', async () => {
    render(<ConfigAdvisor />);

    const ramSelect = screen.getByDisplayValue(/512 GB/i);
    fireEvent.change(ramSelect, { target: { value: '256' } });

    fireEvent.click(screen.getByText(/Analyse Architecture/i));

    const warningBadge = await screen.findByText(/OOM crash risk as voting validator/i, {}, { timeout: 2000 });
    expect(warningBadge).toBeInTheDocument();
  });

  it('should mark RAM as critical below the 256 GB minimum', async () => {
    render(<ConfigAdvisor />);

    const ramSelect = screen.getByDisplayValue(/512 GB/i);
    fireEvent.change(ramSelect, { target: { value: '128' } });

    fireEvent.click(screen.getByText(/Analyse Architecture/i));

    const criticalBadge = await screen.findByText(/Below absolute minimum/i, {}, { timeout: 2000 });
    expect(criticalBadge).toBeInTheDocument();
  });

  it('should handle non-numeric CPU input gracefully without throwing', async () => {
    render(<ConfigAdvisor />);

    const cpuInput = screen.getByDisplayValue('16');
    fireEvent.change(cpuInput, { target: { value: '' } });

    fireEvent.click(screen.getByText(/Analyse Architecture/i));

    const criticalBadge = await screen.findByText(/Insufficient compute parameters/i, {}, { timeout: 2000 });
    expect(criticalBadge).toBeInTheDocument();
  });
});
