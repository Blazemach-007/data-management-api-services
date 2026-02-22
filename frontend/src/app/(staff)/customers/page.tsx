'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer, getCustomers, CustomerData } from '@/services/customerService';

interface Message {
  text: string;
  type: 'success' | 'error' | '';
}

export default function AddCustomerPage() {
  const router = useRouter();
  
  // -- Search State --
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // -- Form State --
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({ text: '', type: '' });
  const [formData, setFormData] = useState<CustomerData>({
    full_name: '',
    phone_number: '',
    email: '',
    address: '',
    pincode: ''
  });

  // Fetch all customers on load for the search feature
  useEffect(() => {
    getCustomers().then(setCustomers).catch(console.error);
  }, []);

  // Filter logic for search bar
  const searchResults = searchTerm.trim() === '' 
    ? [] 
    : customers.filter(c => 
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone_number.includes(searchTerm) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  // Handle selecting an existing customer
  const handleSelectCustomer = (customerId?: string) => {
    if (customerId) {
      router.push(`/transactions?customerId=${customerId}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await createCustomer(formData);
      
      setMessage({ text: '✅ Customer registered successfully! Redirecting...', type: 'success' });
      setFormData({ full_name: '', phone_number: '', email: '', address: '', pincode: '' });
      
      setTimeout(() => {
        const newId = result?.data?.id || '';
        router.push(`/transactions${newId ? `?customerId=${newId}` : ''}`);
      }, 1500);
      
    } catch (error: any) {
      setMessage({ text: `⚠️ ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        
        {/* HEADER */}
        <div style={styles.header}>
            <h1 style={styles.title}>Customer Management</h1>
            <p style={styles.subtitle}>Find an existing customer or register a new profile</p>
        </div>

        <div style={styles.card}>
          
          {/* ========================================= */}
          {/* SECTION 1: SEARCH EXISTING CUSTOMER       */}
          {/* ========================================= */}
          <div style={styles.sectionContainer}>
              <h2 style={styles.sectionTitle}>Find Existing Customer</h2>
              <div style={styles.relativeContainer}>
                  <input 
                      type="text"
                      placeholder="Search by Name, Phone, or Email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={styles.searchInput}
                  />
                  
                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                      <div style={styles.dropdown}>
                          {searchResults.map(customer => (
                              <div 
                                  key={customer.id} 
                                  onClick={() => handleSelectCustomer(customer.id)}
                                  style={styles.dropdownItem}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                  <div style={styles.dropdownTitle}>{customer.full_name}</div>
                                  <div style={styles.dropdownSubtitle}>{customer.phone_number} • {customer.email || 'No Email'}</div>
                              </div>
                          ))}
                      </div>
                  )}
                  {searchTerm !== '' && searchResults.length === 0 && (
                      <div style={styles.dropdownEmpty}>
                          No customers found. Please add them below.
                      </div>
                  )}
              </div>
          </div>

          {/* --- DIVIDER --- */}
          <div style={styles.dividerContainer}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>OR ADD NEW CUSTOMER</span>
              <div style={styles.dividerLine}></div>
          </div>

          {/* ========================================= */}
          {/* SECTION 2: ADD NEW CUSTOMER FORM          */}
          {/* ========================================= */}
          <div style={styles.sectionContainer}>
              <h2 style={styles.sectionTitle}>Register New Profile</h2>

              {/* Feedback Message */}
              {message.text && (
                <div style={{
                    ...styles.alert,
                    ...(message.type === 'success' ? styles.alertSuccess : styles.alertError)
                }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                  
                  {/* Row 1: Name & Phone */}
                  <div style={styles.gridTwo}>
                      <div style={styles.inputGroup}>
                          <label style={styles.label}>Full Name *</label>
                          <input
                              name="full_name"
                              type="text"
                              required
                              style={styles.input}
                              placeholder="Ex: Rahul Sharma"
                              value={formData.full_name}
                              onChange={handleChange}
                          />
                      </div>
                      <div style={styles.inputGroup}>
                          <label style={styles.label}>Phone Number *</label>
                          <input
                              name="phone_number"
                              type="text"
                              required
                              style={styles.input}
                              placeholder="Ex: 9876543210"
                              value={formData.phone_number}
                              onChange={handleChange}
                          />
                      </div>
                  </div>

                  {/* Row 2: Email & Pincode */}
                  <div style={styles.gridTwo}>
                      <div style={styles.inputGroup}>
                          <label style={styles.label}>Email ID</label>
                          <input
                              name="email"
                              type="email"
                              style={styles.input}
                              placeholder="Ex: rahul@example.com"
                              value={formData.email}
                              onChange={handleChange}
                          />
                      </div>
                      <div style={styles.inputGroup}>
                          <label style={styles.label}>Pincode</label>
                          <input
                              name="pincode"
                              type="text"
                              style={styles.input}
                              placeholder="Ex: 560001"
                              value={formData.pincode}
                              onChange={handleChange}
                          />
                      </div>
                  </div>

                  {/* Row 3: Full Address */}
                  <div style={styles.inputGroup}>
                      <label style={styles.label}>Full Address</label>
                      <textarea
                          name="address"
                          rows={3}
                          style={styles.textarea}
                          placeholder="Enter complete address..."
                          value={formData.address}
                          onChange={handleChange}
                      ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '30px' }}>
                      <button
                      type="submit"
                      disabled={loading}
                      style={{
                          ...styles.button,
                          ...(loading ? styles.buttonDisabled : styles.buttonEnabled)
                      }}
                      >
                      {loading ? 'Saving...' : 'Register & Continue to Transactions'}
                      </button>
                  </div>
              </form>
          </div>

        </div>
      </div>
    </main>
  );
}

// --- STANDARD CSS STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    contentWrapper: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px'
    },
    title: {
        fontSize: '2.2rem',
        fontWeight: '800',
        color: '#1e293b',
        margin: '0 0 10px 0'
    },
    subtitle: {
        color: '#64748b',
        margin: 0,
        fontSize: '1.1rem'
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
    },
    sectionContainer: {
        marginBottom: '20px'
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#334155',
        marginBottom: '20px',
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: '10px'
    },
    // Search specific styles
    relativeContainer: {
        position: 'relative'
    },
    searchInput: {
        padding: '16px',
        borderRadius: '8px',
        border: '2px solid #bfdbfe',
        fontSize: '1.05rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#f8fafc',
        transition: 'border-color 0.2s',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxHeight: '250px',
        overflowY: 'auto',
        zIndex: 10
    },
    dropdownItem: {
        padding: '15px',
        borderBottom: '1px solid #f1f5f9',
        cursor: 'pointer',
        transition: 'background-color 0.1s'
    },
    dropdownTitle: {
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '4px'
    },
    dropdownSubtitle: {
        fontSize: '0.85rem',
        color: '#64748b'
    },
    dropdownEmpty: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#64748b',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 10
    },
    // Divider
    dividerContainer: {
        display: 'flex',
        alignItems: 'center',
        margin: '40px 0'
    },
    dividerLine: {
        flexGrow: 1,
        borderTop: '1px solid #cbd5e1'
    },
    dividerText: {
        margin: '0 20px',
        color: '#94a3b8',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        letterSpacing: '0.05em'
    },
    // Form Layout
    gridTwo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '20px'
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#475569'
    },
    input: {
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    },
    textarea: {
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        width: '100%',
        minHeight: '100px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
    },
    // Buttons
    button: {
        width: '100%',
        padding: '16px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s ease'
    },
    buttonEnabled: {
        backgroundColor: '#2563eb',
        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
        cursor: 'not-allowed'
    },
    // Alerts
    alert: {
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '25px',
        textAlign: 'center',
        fontWeight: '600'
    },
    alertSuccess: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #bbf7d0'
    },
    alertError: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca'
    }
};