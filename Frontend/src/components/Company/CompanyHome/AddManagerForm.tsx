import React, { useState, useEffect } from 'react';

interface AddManagerFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any; // Added this prop
}

const AddManagerForm: React.FC<AddManagerFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'CAIRO HQ',
    role: 'Project Manager'
  });

  // Effect to populate data if we are editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        password: '', // Usually don't pre-fill password for security
        department: initialData.dept,
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
      <div style={styles.formGroup}>
        <label style={styles.label}>Full Name</label>
        <input 
          type="text" 
          value={formData.name}
          style={styles.input} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required 
        />
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
      <div style={styles.formGroup}>
        <label style={styles.label}>Department</label>
        <select 
            style={styles.input} 
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
        >
          <option>CAIRO HQ</option>
          <option>COMPLIANCE UNIT</option>
          <option>LEGAL OPERATIONS</option>
        </select>
      </div>

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