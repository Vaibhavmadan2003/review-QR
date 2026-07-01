'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  description: string;
  googleBusinessUrl: string;
  category: string;
  customCategory?: string;
  location: string;
  reviews: string[];
  createdAt: string;
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    googleBusinessUrl: '',
    category: '',
    customCategory: '',
    location: '',
    batches: 1,
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (error) {
      const saved = localStorage.getItem('businesses');
      if (saved) {
        setBusinesses(JSON.parse(saved));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryToUse = formData.category === 'Other' ? formData.customCategory : formData.category;

      const reviewResponse = await fetch('/api/generate-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.name,
          category: categoryToUse,
          description: formData.description,
          location: formData.location,
          batches: formData.batches || 1,
        }),
      });

      const reviewData = await reviewResponse.json();
      const generatedReviews = reviewData.reviews || [];

      if (editingId) {
        const updated = businesses.map(b =>
          b.id === editingId
            ? { 
                ...b, 
                name: formData.name,
                description: formData.description,
                googleBusinessUrl: formData.googleBusinessUrl,
                category: categoryToUse,
                customCategory: formData.customCategory,
                location: formData.location,
                reviews: generatedReviews 
              }
            : b
        );
        const updatedBusiness = updated.find(b => b.id === editingId);
        await fetch('/api/businesses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBusiness),
        });
        localStorage.setItem('businesses', JSON.stringify(updated));
        setBusinesses(updated);
        setEditingId(null);
      } else {
        const newBusiness: Business = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          googleBusinessUrl: formData.googleBusinessUrl,
          category: categoryToUse,
          customCategory: formData.customCategory,
          location: formData.location,
          reviews: generatedReviews,
          createdAt: new Date().toISOString(),
        };
        await fetch('/api/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBusiness),
        });
        const updated = [...businesses, newBusiness];
        localStorage.setItem('businesses', JSON.stringify(updated));
        setBusinesses(updated);
      }

      setFormData({ name: '', description: '', googleBusinessUrl: '', category: '', customCategory: '', location: '', batches: 1 });
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (business: Business) => {
    setFormData({
      name: business.name,
      description: business.description,
      googleBusinessUrl: business.googleBusinessUrl,
      category: business.category === business.customCategory ? 'Other' : business.category,
      customCategory: business.customCategory || '',
      location: business.location,
    });
    setEditingId(business.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this business?')) {
      await fetch(`/api/businesses?id=${id}`, { method: 'DELETE' });
      const updated = businesses.filter(b => b.id !== id);
      localStorage.setItem('businesses', JSON.stringify(updated));
      setBusinesses(updated);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '64px 16px'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            padding: '12px 24px',
            marginBottom: '24px'
          }}>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>⭐ Smart Review Management</span>
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 900, color: 'white', marginBottom: '16px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Review Genius
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '42rem', margin: '0 auto' }}>
            Auto-generate AI-powered reviews. Add business → Get QR → Customers leave reviews instantly!
          </p>
        </div>

        {/* Add Business Button */}
        {!showForm && (
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: 'white',
                color: '#667eea',
                padding: '16px 40px',
                borderRadius: '9999px',
                fontWeight: 900,
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              + Add New Business
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            padding: '40px',
            maxWidth: '42rem',
            margin: '0 auto 48px'
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#1f2937', marginBottom: '32px' }}>
              {editingId ? '✏️ Edit Business' : '➕ Add New Business'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., ABC Plumbing Services"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>
                  Business Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    resize: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Describe your business, services, expertise..."
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>
                  Business Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., New York, NYC or Sector 5, Gurugram"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, customCategory: '' })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Category</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Beauty Salon">Beauty Salon</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Repair">Repair Services</option>
                  <option value="Construction">Construction</option>
                  <option value="Astrologer">Astrologer</option>
                  <option value="Tarot Reading">Tarot Reading</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.category === 'Other' && (
                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>
                    Specify Your Category *
                  </label>
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #667eea',
                      borderRadius: '12px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Pet Grooming, Web Development, etc."
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>
                  Google Business URL *
                </label>
                <input
                  type="url"
                  value={formData.googleBusinessUrl}
                  onChange={(e) => setFormData({ ...formData, googleBusinessUrl: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://www.google.com/maps/place/..."
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>
                  Number of Batches (20 reviews per batch) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.batches}
                  onChange={(e) => setFormData({ ...formData, batches: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  1 batch = 20 reviews | 2 batches = 40 reviews | 3 batches = 60 reviews (max 5)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    opacity: loading ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? '⏳ Generating...' : editingId ? '✓ Update' : '✓ Add & Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', googleBusinessUrl: '', category: '', customCategory: '', location: '', batches: 1 });
                  }}
                  style={{
                    flex: 1,
                    background: '#e5e7eb',
                    color: '#374151',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#d1d5db')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Businesses Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {businesses.map((business) => (
            <div
              key={business.id}
              style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-8px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '32px 24px',
                color: 'white'
              }}>
                <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>
                  {business.name}
                </h3>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>
                  {business.category}
                </p>
                <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  📍 {business.location}
                </p>
              </div>

              <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: '#fef3c7',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#92400e', fontSize: '12px', marginBottom: '4px' }}>AI-Generated Reviews</p>
                  <p style={{ color: '#d97706', fontSize: '32px', fontWeight: 900 }}>
                    {business.reviews.length}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link
                    href={`/customer/${business.id}`}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    👁️ Customer Page
                  </Link>

                  <Link
                    href={`/qr/${business.id}`}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    📱 Get QR Code
                  </Link>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleEdit(business)}
                      style={{
                        flex: 1,
                        background: '#f59e0b',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#d97706')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#f59e0b')}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(business.id)}
                      style={{
                        flex: 1,
                        background: '#ef4444',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {businesses.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
            <p style={{ fontSize: '56px', marginBottom: '24px' }}>📱</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>No businesses yet</p>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>Add your first business to start!</p>
          </div>
        )}
      </div>
    </div>
  );
}
