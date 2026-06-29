'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  description: string;
  googleBusinessUrl: string;
  category: string;
  reviews: string[];
  createdAt: string;
}

export default function CustomerPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/businesses?id=${businessId}`);
        const data = await res.json();
        setBusiness(data);
      } catch (error) {
        // Fallback to localStorage
        const saved = localStorage.getItem('businesses');
        if (saved) {
          const businesses = JSON.parse(saved);
          const found = businesses.find((b: Business) => b.id === businessId);
          setBusiness(found);
        }
      }
    };
    
    fetchBusiness();
  }, [businessId]);

  const handleLeaveReview = () => {
    if (business) {
      window.open(business.googleBusinessUrl, '_blank');
    }
  };

  const handleCopy = () => {
    if (business) {
      const review = business.reviews[selectedIndex];
      navigator.clipboard.writeText(review);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <div className="text-7xl animate-bounce">⭐</div>
          </div>
          <h1 className="text-5xl font-black text-gray-800 mb-4">
            {business.name}
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            {business.category}
          </p>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl p-8 border-4 border-green-300 mb-8">
            <p className="text-gray-800 text-lg leading-relaxed font-semibold">
              {business.description}
            </p>
          </div>
          <p className="text-gray-600 text-lg">
            📝 Share your experience and help others make informed decisions
          </p>
        </div>

        {/* Main Review Card */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-green-300">
            {/* Review Display */}
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white p-12">
              <div className="flex items-center justify-between mb-8">
                <div className="text-5xl">⭐⭐⭐⭐⭐</div>
                <span className="bg-white/30 backdrop-blur-md px-6 py-3 rounded-full text-sm font-bold">
                  {selectedIndex + 1} of {business.reviews.length}
                </span>
              </div>

              <p className="text-3xl font-black leading-relaxed mb-10 drop-shadow-lg">
                "{business.reviews[selectedIndex]}"
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleLeaveReview}
                  className="flex-1 bg-white text-green-600 py-4 rounded-xl font-black text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
                >
                  ✍️ Leave This Review
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex-1 ${copied ? 'bg-yellow-400' : 'bg-yellow-300'} text-gray-800 py-4 rounded-xl font-black text-lg hover:shadow-lg transition-all transform hover:-translate-y-1`}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Text'}
                </button>
              </div>
            </div>

            {/* Review Navigation */}
            <div className="p-12 bg-gray-50 border-t-4 border-gray-200">
              <p className="text-gray-800 font-bold mb-8 text-center text-lg">
                💭 Other customers' experiences:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {business.reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`py-4 px-3 rounded-xl font-bold text-lg transition-all transform hover:scale-110 ${
                      selectedIndex === index
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl'
                        : 'bg-white text-gray-700 border-3 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    #{index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border-4 border-blue-200 mb-12 text-center">
          <p className="text-3xl mb-6">🔒</p>
          <h3 className="text-2xl font-black text-gray-800 mb-4">
            Why Your Review Matters
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            Honest reviews help businesses improve their services and help new customers make confident decisions. Your feedback is valuable and appreciated!
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white shadow-2xl border-4 border-green-700">
            <p className="text-5xl mb-6">💝</p>
            <h2 className="text-3xl font-black mb-6">Ready to Share Your Experience?</h2>
            <p className="text-xl mb-8 text-green-100">
              Choose any review above that matches your experience or write your own!
            </p>
            <button
              onClick={handleLeaveReview}
              className="bg-white text-green-600 px-12 py-4 rounded-2xl font-black text-xl hover:shadow-lg transition-all transform hover:-translate-y-1 inline-block"
            >
              Leave Your 5-Star Review Now ⭐
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-lg">💙 Thank you for supporting {business.name}!</p>
          <p className="text-sm mt-2">Your honest feedback helps us serve you better</p>
        </div>
      </div>
    </div>
  );
}
