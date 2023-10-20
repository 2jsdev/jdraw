
import React, { useRef } from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, description }) => {

    const modalContentRef = useRef<HTMLDivElement>(null);
    const handleClickOutside = (event: React.MouseEvent) => {
        if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClickOutside}>
            <div className="modal-content" ref={modalContentRef}>
                <h2>{title}</h2>
                <p>{description}</p>
                <div className="modal-actions">
                    <button className='button' onClick={onClose}>Cancelar</button>
                    <button className='button confirm-button' onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
