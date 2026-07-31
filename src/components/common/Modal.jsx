import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, footer = null }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Fully inline styles so Bootstrap's .modal class never interferes
    return createPortal(
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="pm-modal-title"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    width: '100%',
                    maxWidth: '520px',
                    margin: '16px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid #e2e8f0',
                }}>
                    <span
                        id="pm-modal-title"
                        style={{ fontSize: 17, fontWeight: 600, color: '#0f172a' }}
                    >
                        {title}
                    </span>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 22,
                            cursor: 'pointer',
                            color: '#94a3b8',
                            lineHeight: 1,
                            padding: '2px 6px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px', flex: 1 }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: '12px 24px 20px',
                        display: 'flex',
                        gap: 10,
                        justifyContent: 'flex-end',
                        borderTop: '1px solid #e2e8f0',
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
