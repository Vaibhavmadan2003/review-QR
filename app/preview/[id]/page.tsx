'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function PreviewPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [selectedReview, setSelectedReview] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('businesses');
    if (saved) {
      const businesses = JSON.parse(saved);
      const found = businesses.find((b: Business) => b.id === businessId);
      setBusiness(found);
    }
    setShowAnimation(true);
  }, [businessId]);

  const handleReviewClick = (index: number) => {
    const reviewUrl = business?.googleBusinessUrl || '';
    const reviewText = business?.reviews[index] || '';
    
    // Open Google review with text suggestion
    window.open(reviewUrl, '_blank');
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-6">
            <div className="text-6xl animate-bounce">⭐</div>
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-3">
            {business.name}
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            We'd love your feedback!
          </p>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 mb-8">
            <p className="text-gray-800 font-semibold text-sm leading-relaxed">
              {business.description}
            </p>
          </div>
        </div>

        {/* Main Review Card */}
        <div className={`mb-12 transition-all duration-700 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Review Content */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">⭐⭐⭐⭐⭐</div>
                <span className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold">
                  Review {selectedReview + 1}/{business.reviews.length}
                </span>
              </div>
              
              <p className="text-2xl font-black leading-relaxed mb-8">
                "{business.reviews[selectedReview]}"
              </p>

              {/* CTA Button */}
              <button
                onClick={() => handleReviewClick(selectedReview)}
                className="w-full bg-white text-green-600 py-4 rounded-xl font-black text-lg hover:shadow-lg transition-all transform hover:-translate-y-1 mb-4"
              >
                ✍️ Share This Review
              </button>
              
              <p className="text-center text-white/80 text-sm">
                Click to leave your review on Google
              </p>
            </div>

            {/* Review Navigation */}
            <div className="p-8 bg-gray-50 border-t-4 border-gray-200">
              <p className="text-gray-700 font-bold mb-6 text-center">
                Don't see your experience? Browse other reviews:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {business.reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedReview(index)}
                    className={`py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                      selectedReview === index
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    #{index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Incentive Section */}
        <div className={`bg-white rounded-3xl shadow-xl p-8 mb-12 transition-all duration-700 delay-200 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center">
            <p className="text-3xl mb-4">💝</p>
            <h3 className="text-2xl font-black text-gray-800 mb-3">
              Your Review Matters!
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Genuine reviews help us serve you better and build trust with our community. Thank you for taking the time to share your experience!
            </p>
          </div>
        </div>

        {/* Alternative Review Option */}
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 text-center transition-all duration-700 delay-300 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-gray-700 mb-6 font-semibold text-lg">
            Want to write your own unique review?
          </p>
          <a
            href={business.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            ✍️ Write Custom Review
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>💙 Thank you for supporting {business.name}!</p>
          <p className="mt-2 text-gray-500">Your honest feedback is invaluable</p>
        </div>
      </div>
    </div>
  );
}
