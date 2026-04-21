import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import RPCDoctor from './RPCDoctor';


global.fetch = vi.fn();

describe('RPC Doctor Telemetry Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the default interface correctly', () => {
    render(<RPCDoctor />);

    expect(screen.getByText(/Network Telemetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Real time latency & vector auditing/i)).toBeInTheDocument();
  });

  it('should allow the user to input a custom RPC URL', () => {
    render(<RPCDoctor />);
    const inputField = screen.getByDisplayValue('https://api.testnet.solana.com');
    

    fireEvent.change(inputField, { target: { value: 'https://custom.solana.node.com' } });
    expect(inputField.value).toBe('https://custom.solana.node.com');
  });

  it('should trigger the diagnostics fetch when Initialise is clicked', async () => {

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'Healthy', epoch: 400, version: '1.18', slot: 1000, latency: 45, timestamp: '12:00:00' })
    });

    render(<RPCDoctor />);
    

    const initButton = screen.getByText(/Initialise/i);
    fireEvent.click(initButton);


    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});