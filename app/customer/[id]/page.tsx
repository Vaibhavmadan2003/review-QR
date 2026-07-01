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
      navigator.clipboard.writeText(business.reviews[selectedIndex]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => {
        window.open(business.googleBusinessUrl, '_blank');
      }, 300);
    }
  };

  const handlePrevious = () => {
    setSelectedIndex(prev => (prev === 0 ? business!.reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex(prev => (prev === business!.reviews.length - 1 ? 0 : prev + 1));
  };

  if (!business) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid white',
            borderTop: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #fce7f3 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <section style={{ paddingTop: '64px', paddingBottom: '32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'inline-block', background: 'linear-gradient(90deg, #fce7f3, #f3e8ff)', color: '#be185d', padding: '8px 24px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold', marginBottom: '24px' }}>
            ⭐ PREMIUM 5-STAR REVIEWS
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 900, background: 'linear-gradient(90deg, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
            {business.name}
          </h1>
          <p style={{ fontSize: '24px', color: '#ec4899', fontWeight: 'bold', marginBottom: '16px' }}>
            {business.category}
          </p>
          <div style={{ fontSize: '36px', letterSpacing: '8px', marginBottom: '24px' }}>
            ⭐⭐⭐⭐⭐
          </div>
          <p style={{ fontSize: '18px', color: '#374151', fontWeight: '600' }}>
            {business.reviews.length} Beautiful, Authentic Customer Reviews
          </p>
        </div>
      </section>

      {/* Main Review Card */}
      <section style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}>
            {/* Review Content */}
            <div style={{ padding: '48px 32px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '40px' }}>⭐⭐⭐⭐⭐</div>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 24px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255, 255, 255, 0.4)'
                }}>
                  Review {selectedIndex + 1} / {business.reviews.length}
                </span>
              </div>

              <p style={{
                fontSize: '28px',
                fontWeight: 'bold',
                lineHeight: '1.6',
                marginBottom: '48px',
                fontStyle: 'italic',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                "{business.reviews[selectedIndex]}"
              </p>

              <button
                onClick={handleLeaveReview}
                style={{
                  width: '100%',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  fontWeight: 900,
                  fontSize: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: copied ? '#4ade80' : 'white',
                  color: copied ? '#1f2937' : '#ec4899',
                  transform: copied ? 'scale(1)' : 'scale(1)',
                }}
                onMouseEnter={(e) => !copied && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => !copied && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {copied ? '✓ Copied! Opening Google...' : '📋 Copy Review & Open Google'}
              </button>
            </div>

            {/* Navigation Bar */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <button
                onClick={handlePrevious}
                style={{
                  background: 'white',
                  color: '#ec4899',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                ◀ Previous
              </button>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1, maxWidth: '42rem', padding: '8px' }}>
                {business.reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    style={{
                      flexShrink: 0,
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: selectedIndex === index ? 'white' : 'rgba(255, 255, 255, 0.3)',
                      color: selectedIndex === index ? '#ec4899' : 'white',
                      transform: selectedIndex === index ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: selectedIndex === index ? '0 4px 6px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                style={{
                  background: 'white',
                  color: '#ec4899',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Review Grid Cards */}
      <section style={{ padding: '64px 16px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, textAlign: 'center', marginBottom: '48px', color: '#1f2937' }}>
            What Customers Love
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {business.reviews.slice(0, 6).map((review, index) => (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid',
                  background: selectedIndex === index
                    ? 'linear-gradient(135deg, #ec4899, #a855f7)'
                    : 'white',
                  color: selectedIndex === index ? 'white' : '#1f2937',
                  borderColor: selectedIndex === index ? 'white' : '#fce7f3',
                  transform: selectedIndex === index ? 'scale(1.05) translateY(-8px)' : 'scale(1) translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (selectedIndex !== index) {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIndex !== index) {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.7 }}>#{index + 1}</span>
                </div>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  color: selectedIndex === index ? 'white' : '#4b5563'
                }}>
                  {review}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '64px 16px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, textAlign: 'center', marginBottom: '48px', color: '#1f2937' }}>
            Why Leave a Review?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {[
              { emoji: '💙', title: 'Help Others', desc: 'Real reviews help people find the perfect service', bgGrad: 'linear-gradient(135deg, #dbeafe, #eff6ff)' },
              { emoji: '🎯', title: 'Support Excellence', desc: 'Reward great service and inspire improvement', bgGrad: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' },
              { emoji: '🌟', title: 'Build Community', desc: 'Strong reviews build trust and credibility', bgGrad: 'linear-gradient(135deg, #dcfce7, #f0fdf4)' }
            ].map((item, i) => (
              <div key={i} style={{
                background: item.bgGrad,
                borderRadius: '16px',
                padding: '32px',
                border: '2px solid',
                borderColor: ['#93c5fd', '#fbcfe8', '#86efac'][i],
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-8px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <p style={{ fontSize: '48px', marginBottom: '16px' }}>{item.emoji}</p>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: ['#1e3a8a', '#831843', '#166534'][i]
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: ['#1e40af', '#9f1239', '#15803d'][i],
                  fontWeight: '500'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section style={{ padding: '64px 16px' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)',
            borderRadius: '24px',
            padding: '64px 32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.2,
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '384px',
                height: '384px',
                background: 'white',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'blob 7s infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '384px',
                height: '384px',
                background: '#fce7f3',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'blob 7s infinite 2s'
              }}></div>
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <p style={{ fontSize: '56px', marginBottom: '24px', animation: 'bounce 2s infinite' }}>💝</p>
              <h2 style={{ fontSize: '44px', fontWeight: 900, marginBottom: '24px' }}>
                Share Your Experience!
              </h2>
              <p style={{ fontSize: '18px', marginBottom: '40px', opacity: 0.95, maxWidth: '32rem', margin: '0 auto 40px' }}>
                Pick a review that matches your experience, copy it with one click, and post it on Google. Takes 30 seconds!
              </p>
              <button
                onClick={handleLeaveReview}
                style={{
                  background: 'white',
                  color: '#ec4899',
                  padding: '20px 48px',
                  borderRadius: '16px',
                  fontWeight: 900,
                  fontSize: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) translateY(-8px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
              >
                Leave Your 5-Star Review Now ⭐
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section style={{ padding: '48px 16px', borderTop: '4px solid #fbcfe8', background: 'linear-gradient(180deg, transparent, rgba(252, 231, 243, 0.5))' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: '32px',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #ec4899, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            💖 Thank You!
          </p>
          <p style={{ fontSize: '18px', color: '#374151', marginBottom: '8px' }}>
            Thank you for supporting {business.name}
          </p>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>
            Your feedback drives our passion for excellence
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              color: '#ec4899',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '18px',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#be185d')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#ec4899')}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
