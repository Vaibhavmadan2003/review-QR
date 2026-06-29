'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  googleBusinessUrl: string;
  category: string;
  reviews: string[];
  createdAt: string;
}

export default function ReviewPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('businesses');
    if (saved) {
      const businesses = JSON.parse(saved);
      const found = businesses.find((b: Business) => b.id === businessId);
      setBusiness(found);
    }
  }, [businessId]);

  const handleReviewClick = (reviewText: string) => {
    // Build Google review URL with pre-filled text
    const baseUrl = business?.googleBusinessUrl || '';
    
    // Google Forms can't pre-fill review text directly, but we can use intent to review
    // The review text will be shown as a guide before submission
    const reviewUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'opi=90943&hl=en';
    
    // Open in new tab
    window.open(reviewUrl, '_blank');
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 mb-4 shadow-lg">
            <span className="text-4xl">⭐</span>
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            {business.name}
          </h1>
          <p className="text-gray-600">
            📱 Share Your Experience
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <p className="text-gray-700 text-center leading-relaxed">
            We'd love to hear about your experience! Choose a review that matches your experience or write your own. Your 5-star review helps us serve you better.
          </p>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 mb-8">
          {business.reviews.map((review, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedReview(index);
                // Slight delay to show selection before redirect
                setTimeout(() => handleReviewClick(review), 500);
              }}
              className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all transform hover:scale-105 ${
                selectedReview === index ? 'ring-4 ring-green-500' : 'hover:shadow-xl'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">⭐⭐⭐⭐⭐</div>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed mb-3">
                    {review}
                  </p>
                  <button
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    👍 This matches my experience
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Direct Link */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            Or visit directly to leave your own review:
          </p>
          <a
            href={business.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            ✍️ Write Your Own Review
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>💙 Thank you for your feedback!</p>
        </div>
      </div>
    </div>
  );
}
