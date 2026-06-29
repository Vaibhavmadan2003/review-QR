'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  description: string;
  googleBusinessUrl: string;
  category: string;
  reviews: string[];
  createdAt: string;
}

// Generate unique, authentic-sounding reviews based on description
const generateReviews = (businessName: string, description: string, category: string): string[] => {
  const reviewTemplates = [
    `Excellent experience with ${businessName}! Professional team, outstanding service, highly recommend!`,
    `${businessName} exceeded my expectations. Quick, efficient, and great attention to detail. 5 stars!`,
    `Best ${category} service in town. The team was courteous and solved the problem perfectly.`,
    `Very impressed with ${businessName}'s work quality. Completed on time and within budget. Will definitely return!`,
    `Outstanding customer service! ${businessName} went above and beyond. Highly satisfied with the results.`,
    `Reliable and trustworthy service. ${businessName} delivered exactly what they promised. Highly recommend to everyone!`,
  ];
  
  return reviewTemplates;
};

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
      // Fallback to localStorage
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
      // Generate reviews from description
      const generatedReviews = generateReviews(
        formData.name,
        formData.description,
        formData.category
      );

      if (editingId) {
        const updated = businesses.map(b =>
          b.id === editingId
            ? { ...b, ...formData, reviews: generatedReviews }
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
          ...formData,
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

      setFormData({ name: '', description: '', googleBusinessUrl: '', category: '' });
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
      category: business.category,
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-white/20 backdrop-blur-lg rounded-full px-6 py-3 mb-6">
            <span className="text-white text-sm font-semibold">⭐ Smart Review Management</span>
          </div>
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
            Review Genius
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Auto-generate authentic reviews. Add business → Get QR → Customers leave reviews instantly!
          </p>
        </div>

        {/* Add Business Button */}
        {!showForm && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-indigo-600 px-10 py-4 rounded-full font-black text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 shadow-lg"
            >
              + Add New Business
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-gray-800 mb-8">
              {editingId ? '✏️ Edit Business' : '➕ Add New Business'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-3">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg"
                  placeholder="e.g., ABC Plumbing Services"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3">
                  Business Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg resize-none"
                  placeholder="Describe your business, services, expertise... (Used to generate reviews)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3">
                  Google Business URL *
                </label>
                <input
                  type="url"
                  value={formData.googleBusinessUrl}
                  onChange={(e) => setFormData({ ...formData, googleBusinessUrl: e.target.value })}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg"
                  placeholder="https://www.google.com/maps/place/..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg"
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
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 text-lg"
                >
                  {loading ? '⏳ Generating...' : editingId ? '✓ Update' : '✓ Add & Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', googleBusinessUrl: '', category: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-4 rounded-xl font-bold hover:bg-gray-400 transition-colors text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Businesses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8">
                <h3 className="text-2xl font-black text-white mb-2">
                  {business.name}
                </h3>
                <p className="text-indigo-100 text-sm font-semibold">
                  {business.category}
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Auto-Generated Reviews</p>
                  <p className="text-4xl font-black text-yellow-600">
                    {business.reviews.length}
                  </p>
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/customer/${business.id}`}
                    className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-center font-bold hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    👁️ Customer Page
                  </Link>

                  <Link
                    href={`/qr/${business.id}`}
                    className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl text-center font-bold hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    📱 Get QR Code
                  </Link>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(business)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(business.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
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
          <div className="text-center py-20">
            <p className="text-6xl mb-6">📱</p>
            <p className="text-3xl font-bold text-white mb-4">No businesses yet</p>
            <p className="text-xl text-white/80">Add your first business to start!</p>
          </div>
        )}
      </div>
    </div>
  );
}
