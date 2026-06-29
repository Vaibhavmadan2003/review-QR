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

export default function QRPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Get base URL
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/businesses?id=${businessId}`);
        const data = await res.json();
        setBusiness(data);
      } catch (error) {
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

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  const customerUrl = `${baseUrl}/customer/${businessId}`;

  // Generate QR code URL using external service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(customerUrl)}`;

  const handleDownload = async () => {
    const response = await fetch(qrCodeUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.name}-review-qr.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-block mb-8 text-blue-600 hover:text-blue-800 font-bold text-lg"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <h1 className="text-4xl font-black text-gray-800 mb-2 text-center">
            📱 {business.name}
          </h1>
          <p className="text-center text-gray-600 text-lg mb-10">
            Share this QR code with customers
          </p>

          {/* QR Code Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 mb-10 text-center border-4 border-blue-200">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="mx-auto drop-shadow-lg rounded-xl w-80 h-80"
            />
            <p className="text-gray-600 text-sm mt-8 font-semibold">
              Scan this QR code with your phone camera
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              ⬇️ Download QR Code
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              🖨️ Print
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 mb-8">
            <h3 className="font-black text-gray-800 mb-6 text-lg">📋 Review Summary:</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                <span className="text-gray-700 font-semibold">Business:</span>
                <span className="text-indigo-600 font-black">{business.name}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                <span className="text-gray-700 font-semibold">Category:</span>
                <span className="text-indigo-600 font-black">{business.category}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                <span className="text-gray-700 font-semibold">Auto-Generated Reviews:</span>
                <span className="text-indigo-600 font-black">{business.reviews.length}</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
            <h3 className="font-black text-gray-800 mb-6 text-lg">🚀 How It Works:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</span>
                <p className="text-gray-700 pt-1">Customer scans QR code with phone</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</span>
                <p className="text-gray-700 pt-1">Sees beautiful page with 6 authentic review templates</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</span>
                <p className="text-gray-700 pt-1">Picks one that matches their experience</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">4</span>
                <p className="text-gray-700 pt-1">Clicks "Leave This Review" → Opens Google Business Profile</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">5</span>
                <p className="text-gray-700 pt-1">Reviews your business with 5 stars ⭐⭐⭐⭐⭐</p>
              </div>
            </div>
          </div>

          {/* Test Link */}
          <div className="mt-8 text-center pt-8 border-t-2 border-gray-200">
            <p className="text-gray-600 mb-4 font-semibold">Want to preview what customers see?</p>
            <Link
              href={`/customer/${businessId}`}
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              👁️ Preview Customer Page
            </Link>
          </div>

          {/* Direct Link */}
          <div className="mt-8 pt-8 border-t-2 border-gray-200 text-center">
            <p className="text-gray-600 mb-4 font-semibold text-sm">Or share this link directly:</p>
            <div className="bg-gray-100 p-4 rounded-lg break-all">
              <p className="text-sm text-gray-700 font-mono">{customerUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
