import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000,
    },
    content: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      position: 'relative' as 'relative'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0">{title}</h4>
          <i className="bi bi-x-lg cursor-pointer" onClick={onClose}></i>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;