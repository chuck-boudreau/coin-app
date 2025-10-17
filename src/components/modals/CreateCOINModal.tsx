import { useState, useEffect, useRef } from 'react';

interface CreateCOINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  existingNames: string[];
}

export const CreateCOINModal: React.FC<CreateCOINModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingNames
}) => {
  const [coinName, setCoinName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCoinName('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!coinName.trim()) {
      setError('Please enter a name for your COIN');
      return;
    }

    if (existingNames.includes(coinName.trim())) {
      setError('A COIN with this name already exists');
      return;
    }

    onSubmit(coinName.trim());
    setCoinName('');
    setError('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      if (coinName.trim()) {
        if (window.confirm('Discard changes?')) {
          setCoinName('');
          setError('');
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen overlay with backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={handleBackdropClick}
      >
        {/* Modal card */}
        <div 
            style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out'
            }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>
              Create New COIN
            </h2>
          </div>
          
          {/* Form */}
          <div style={{ padding: '24px' }}>
            <label 
              htmlFor="coin-name"
              style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}
            >
              COIN Name
            </label>
            <input
              id="coin-name"
              ref={inputRef}
              type="text"
              value={coinName}
              onChange={(e) => {
                setCoinName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                minHeight: '44px',
                outline: 'none'
              }}
              placeholder="Enter COIN name"
              maxLength={100}
            />
            {error && (
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#ef4444' }} role="alert">
                {error}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                color: '#111827',
                minHeight: '44px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                color: 'white',
                minHeight: '44px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Inline styles for animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};