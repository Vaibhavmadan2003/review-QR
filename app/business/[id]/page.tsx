'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  googleBusinessUrl: string;
  category: string;
  reviews: string[];
  createdAt: string;
}

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [newReview, setNewReview] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('businesses');
    if (saved) {
      const businesses = JSON.parse(saved);
      const found = businesses.find((b: Business) => b.id === businessId);
      setBusiness(found);
    }
  }, [businessId]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !newReview.trim()) return;

    const updated = {
      ...business,
      reviews: [...business.reviews, newReview],
    };

    const saved = localStorage.getItem('businesses');
    if (saved) {
      const businesses = JSON.parse(saved);
      const updated_businesses = businesses.map((b: Business) =>
        b.id === businessId ? updated : b
      );
      localStorage.setItem('businesses', JSON.stringify(updated_businesses));
      setBusiness(updated);
      setNewReview('');
      setShowForm(false);
    }
  };

  const handleDeleteReview = (index: number) => {
    if (!business) return;
    if (!confirm('Delete this review template?')) return;

    const updated = {
      ...business,
      reviews: business.reviews.filter((_, i) => i !== index),
    };

    const saved = localStorage.getItem('businesses');
    if (saved) {
      const businesses = JSON.parse(saved);
      const updated_businesses = businesses.map((b: Business) =>
        b.id === businessId ? updated : b
      );
      localStorage.setItem('businesses', JSON.stringify(updated_businesses));
      setBusiness(updated);
    }
  };

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Link
          href="/"
          className="inline-block mb-6 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-black text-gray-800 mb-2">
            {business.name}
          </h1>
          <p className="text-gray-600 capitalize">
            Category: <span className="font-semibold">{business.category}</span>
          </p>
          <p className="text-gray-600">
            Total Review Templates: <span className="font-bold text-indigo-600">{business.reviews.length}</span>
          </p>
        </div>

        {/* Add Review Button */}
        {!showForm && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              + Add Review Template
            </button>
          </div>
        )}

        {/* Add Review Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ➕ Add Review Template
            </h2>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Review Text (Keep it positive & honest) *
                </label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none resize-none"
                  placeholder="e.g., Excellent service! The team was professional and solved the problem quickly. Highly recommended!"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Tips: Include keywords, be specific, mention what problem was solved
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  Add Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setNewReview('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {business.reviews.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-3xl mb-4">📝</p>
              <p className="text-gray-600 text-lg">No review templates yet</p>
              <p className="text-gray-500">Add review templates to display when customers scan QR</p>
            </div>
          ) : (
            business.reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                        ⭐⭐⭐⭐⭐
                      </span>
                      <span className="text-gray-600 text-sm">Template #{index + 1}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(index)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex-shrink-0"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* QR Code Link */}
        {business.reviews.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href={`/qr/${businessId}`}
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              📱 View QR Code
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
