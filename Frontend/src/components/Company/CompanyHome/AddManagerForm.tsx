import React, { useState, useEffect } from 'react';

interface AddManagerFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any; // Added this prop
}

const AddManagerForm: React.FC<AddManagerFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Project Manager'
  });

  // Effect to populate data if we are editing
  useEffect(() => {
    if (initialData) {
      // Assuming initialData might just have 'name', we might need to split it if we reuse this form for edit
      // For simplicity in this task, we focus on ADD (User request mentioned Add Project Manager)
      // If we need to support edit, we'd need to parse name or change initialData structure.
      const [first, ...rest] = initialData.name ? initialData.name.split(' ') : ['', ''];
      setFormData({
        firstName: first,
        lastName: rest.join(' '),
        email: initialData.email,
        password: '', 
        role: initialData.role
      });
    }
  }, [initialData]);

  const styles = {
    formGroup: { marginBottom: '20px' },
    label: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' as 'uppercase', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
    footer: { display: 'flex', gap: '12px', marginTop: '30px' },
    cancelBtn: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 'bold' },
    submitBtn: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold' }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
            <label style={styles.label}>First Name</label>
            <input 
            type="text" 
            value={formData.firstName}
            style={styles.input} 
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required 
            />
        </div>
        <div style={{ flex: 1 }}>
            <label style={styles.label}>Last Name</label>
            <input 
            type="text" 
            value={formData.lastName}
            style={styles.input} 
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required 
            />
        </div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Email Address</label>
        <input 
          type="email" 
          value={formData.email}
          style={styles.input} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required 
        />
      </div>
      {!initialData && ( // Only show password field when adding new manager
        <div style={styles.formGroup}>
            <label style={styles.label}>Initial Password</label>
            <input 
            type="password" 
            style={styles.input} 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
            />
        </div>
      )}


      <div style={styles.footer}>
        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
        <button type="submit" style={styles.submitBtn}>
            {initialData ? "Update Account" : "Create Account"}
        </button>
      </div>
    </form>
  );
};

export default AddManagerForm;