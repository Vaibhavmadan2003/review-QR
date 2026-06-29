'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as QRCode from 'qrcode';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('businesses');
    if (saved) {
      const businesses = JSON.parse(saved);
      const found = businesses.find((b: Business) => b.id === businessId);
      setBusiness(found);
    }
  }, [businessId]);

  useEffect(() => {
    if (business && canvasRef.current) {
      // Get the actual origin - works with IP addresses too
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      const host = typeof window !== 'undefined' ? window.location.host : '';
      const reviewUrl = `${protocol}//${host}/customer/${businessId}`;
      QRCode.toCanvas(
        canvasRef.current,
        reviewUrl,
        {
          errorCorrectionLevel: 'H',
          width: 400,
          margin: 20,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Error:', error);
        }
      );
    }
  }, [business, businessId]);

  const handleDownload = () => {
    if (canvasRef.current && business) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${business.name}-review-qr.png`;
      link.href = url;
      link.click();
    }
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

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

          {/* QR Code */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 mb-10 text-center border-4 border-blue-200">
            <canvas
              ref={canvasRef}
              className="mx-auto drop-shadow-lg"
            />
            <p className="text-gray-600 text-sm mt-8 font-semibold">
              Customers will see beautiful review templates when they scan this code
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
                <p className="text-gray-700 pt-1">Clicks "Share" → Opens Google Business Profile</p>
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
        </div>
      </div>
    </div>
  );
}
