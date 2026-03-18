import React, { useState, useEffect } from 'react';

interface AddEmployeeFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    nationalId: '',
    title: '',
    canViewContracts: false,
    canAddPolicy: false,
    canSignContract: false,
    canAcceptProposals: false
  });

  useEffect(() => {
    if (initialData) {
      const { user, nationalId, title, canViewContracts, canAddPolicy, canSignContract, canAcceptProposals } = initialData;
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        password: '', 
        nationalId: nationalId || '',
        title: title || '', 
        canViewContracts: canViewContracts || false,
        canAddPolicy: canAddPolicy || false,
        canSignContract: canSignContract || false,
        canAcceptProposals: canAcceptProposals || false
      });
    }
  }, [initialData]);

  const styles = {
    formGroup: { marginBottom: '20px' },
    label: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' as 'uppercase', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
    checkboxContainer: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
    checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
    checkboxLabel: { fontSize: '13px', color: '#334155', fontWeight: '500', cursor: 'pointer' },
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
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
            <label style={styles.label}>Email Address</label>
            <input 
            type="email" 
            value={formData.email}
            style={styles.input} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
            />
        </div>
        <div style={{ flex: 1 }}>
            <label style={styles.label}>National ID</label>
            <input 
            type="text" 
            value={formData.nationalId}
            style={styles.input} 
            onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
            required 
            />
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Job Title</label>
        <input 
          type="text" 
          value={formData.title}
          style={styles.input} 
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required 
        />
      </div>
      {!initialData && (
        <div style={styles.formGroup}>
            <label style={styles.label}>Initial Password</label>
            <input 
            type="password" 
            style={styles.input} 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required={!initialData} 
            />
        </div>
      )}

      <div style={styles.formGroup}>
        <label style={{...styles.label, marginTop: '20px'}}>Permissions</label>
        
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={formData.canViewContracts} 
            onChange={(e) => setFormData({...formData, canViewContracts: e.target.checked})} 
            style={styles.checkbox}
          />
          <span style={styles.checkboxLabel}>Can View Signed Contracts (Repository Access)</span>
        </label>
        
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={formData.canAddPolicy} 
            onChange={(e) => setFormData({...formData, canAddPolicy: e.target.checked})} 
            style={styles.checkbox}
          />
          <span style={styles.checkboxLabel}>Can Add Policies</span>
        </label>
        
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={formData.canSignContract} 
            onChange={(e) => setFormData({...formData, canSignContract: e.target.checked})} 
            style={styles.checkbox}
          />
          <span style={styles.checkboxLabel}>Ongoing Contracts Access</span>
        </label>
        
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={formData.canAcceptProposals} 
            onChange={(e) => setFormData({...formData, canAcceptProposals: e.target.checked})} 
            style={styles.checkbox}
          />
          <span style={styles.checkboxLabel}>Can Accept Proposals</span>
        </label>
      </div>

      <div style={styles.footer}>
        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
        <button type="submit" style={styles.submitBtn}>
            {initialData ? "Update Employee" : "Create Employee"}
        </button>
      </div>
    </form>
  );
};

export default AddEmployeeForm;
