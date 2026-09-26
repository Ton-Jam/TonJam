import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateJamSpaceModal } from '@/pages/JamSpace/components/CreateJamSpaceModal';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', displayName: 'TonJam Creator' },
    userProfile: { uid: 'test-user-123', displayName: 'TonJam Creator', photoURL: 'https://example.com/avatar.jpg' },
  }),
}));

// Mock AudioContext
const mockAddNotification = vi.fn();
vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    addNotification: mockAddNotification,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('CreateJamSpaceModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<CreateJamSpaceModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Create JamSpace')).toBeDefined();
    expect(screen.getByLabelText(/JamSpace Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Description/i)).toBeDefined();
    expect(screen.getByText('Public')).toBeDefined();
    expect(screen.getByText('Private')).toBeDefined();
    expect(screen.getByText('Go Live Now')).toBeDefined();
  });

  it('validates empty name and prevents submission', async () => {
    render(<CreateJamSpaceModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitBtn = screen.getByText('Go Live Now');
    fireEvent.click(submitBtn);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid space data when inputs are provided', async () => {
    render(<CreateJamSpaceModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/JamSpace Name/i);
    const descInput = screen.getByLabelText(/Description/i);

    fireEvent.change(nameInput, { target: { value: 'Electronic Sunset Stems' } });
    fireEvent.change(descInput, { target: { value: 'Testing out new synth presets with the crowd.' } });

    const submitBtn = screen.getByText('Go Live Now');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Electronic Sunset Stems',
        description: 'Testing out new synth presets with the crowd.',
        visibility: 'public',
        coverUrl: undefined,
      });
    });
  });

  it('allows toggling between Public and Private visibility', async () => {
    render(<CreateJamSpaceModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const privateBtn = screen.getByText('Private');
    fireEvent.click(privateBtn);

    const nameInput = screen.getByLabelText(/JamSpace Name/i);
    fireEvent.change(nameInput, { target: { value: 'Private VIP Session' } });

    const submitBtn = screen.getByText('Go Live Now');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          visibility: 'private',
        })
      );
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<CreateJamSpaceModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
