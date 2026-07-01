'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  description: string;
  googleBusinessUrl: string;
  category: string;
  location: string;
  reviews: string[];
  createdAt: string;
}

export default function QRPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    const fetchBusiness = async () => {
      try {
        // Check localStorage first - PRIMARY SOURCE
        const saved = localStorage.getItem('businesses');
        if (saved) {
          const businesses = JSON.parse(saved);
          const found = businesses.find((b: Business) => b.id === businessId);
          if (found) {
            setBusiness(found);
            return; // Found in localStorage, use it
          }
        }

        // Fallback to API if not in localStorage
        try {
          const res = await fetch(`/api/businesses?id=${businessId}`);
          const data = await res.json();
          if (data && data.id) {
            setBusiness(data);
            // Save to localStorage
            const savedList = localStorage.getItem('businesses') || '[]';
            const businesses = JSON.parse(savedList);
            const idx = businesses.findIndex((b: Business) => b.id === businessId);
            if (idx >= 0) {
              businesses[idx] = data;
            } else {
              businesses.push(data);
            }
            localStorage.setItem('businesses', JSON.stringify(businesses));
          }
        } catch (apiError) {
          console.log('API unavailable, using localStorage');
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      }
    };

    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      handleLogoUpload(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files?.[0]) {
      handleLogoUpload(files[0]);
    }
  };

  if (!business) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
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
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const customerUrl = `${baseUrl}/customer/${businessId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customerUrl)}`;

  const handleDownloadTemplate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 1400;

    // WHITE BACKGROUND
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1200, 1400);

    // Border around entire canvas - black
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 1160, 1360);

    // Main white card with rounded corners (inner card)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    const radius = 40;
    ctx.moveTo(60 + radius, 60);
    ctx.lineTo(1140 - radius, 60);
    ctx.quadraticCurveTo(1140, 60, 1140, 60 + radius);
    ctx.lineTo(1140, 1340 - radius);
    ctx.quadraticCurveTo(1140, 1340, 1140 - radius, 1340);
    ctx.lineTo(60 + radius, 1340);
    ctx.quadraticCurveTo(60, 1340, 60, 1340 - radius);
    ctx.lineTo(60, 60 + radius);
    ctx.quadraticCurveTo(60, 60, 60 + radius, 60);
    ctx.fill();

    // Load and draw logo
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    // Use uploaded logo if available, otherwise use default
    logoImg.src = uploadedLogo || '/logos/WebTech_Logo-1.png';

    logoImg.onload = () => {
      try {
        // Draw logo (150x150) - proper size
        ctx.drawImage(logoImg, 525, 80, 150, 150);
        continueDrawing();
      } catch (err) {
        console.warn('Logo load error, continuing without logo:', err);
        continueDrawing();
      }
    };

    logoImg.onerror = () => {
      console.warn('Logo file not found, continuing without logo');
      continueDrawing();
    };

    const continueDrawing = () => {
      // Business name - BLACK TEXT
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(business.name, 600, 280);

      // Divider line
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, 320);
      ctx.lineTo(1020, 320);
      ctx.stroke();

      // QR Code
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = qrCodeUrl;

      qrImg.onload = () => {
        // White background for QR with black border
        ctx.fillStyle = 'white';
        ctx.fillRect(450, 380, 300, 300);
        
        // Black border around QR code
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeRect(450, 380, 300, 300);
        
        ctx.drawImage(qrImg, 455, 385, 290, 290);

        // Divider
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(180, 740);
        ctx.lineTo(1020, 740);
        ctx.stroke();

        // Tagline section - BLACK TEXT
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AI-Powered Reviews', 600, 820);

        ctx.fillStyle = '#000000';
        ctx.font = '22px Arial';
        ctx.fillText('Get Authentic 5-Star Reviews Instantly', 600, 870);

        // Footer - BLACK TEXT
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText('Powered by WebTech Solutions', 600, 1280);

        // Download the canvas as image
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${business.name}-QR-Template.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 'image/png');
      };

      qrImg.onerror = () => {
        alert('Failed to load QR code. Please try again.');
      };
    };
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8, #d9e8f5)',
      padding: '32px 16px'
    }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: '32px',
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '18px',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1e40af')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
        >
          ← Back to Dashboard
        </Link>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
          padding: '48px 32px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 900,
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            📱 {business.name}
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '32px'
          }}>
            Beautiful QR Code Template
          </p>

          {/* QR Code Display */}
          <div style={{
            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            borderRadius: '24px',
            padding: '48px 32px',
            marginBottom: '32px',
            border: '3px solid #e5e7eb',
            textAlign: 'center'
          }}>
            {/* Template Preview */}
            <div id="qr-template" style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px 40px',
              maxWidth: '550px',
              margin: '0 auto',
              color: 'black',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              border: '8px solid black'
            }}>
              {/* Logo - No padding, just display */}
              {uploadedLogo ? (
                <img
                  src={uploadedLogo}
                  alt="Company Logo"
                  style={{
                    width: 'auto',
                    height: '150px',
                    margin: '0 auto 15px',
                    display: 'block',
                    maxWidth: '150px',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <img
                  src="/logos/WebTech_Logo-1.png"
                  alt="Company Logo"
                  style={{
                    width: 'auto',
                    height: '150px',
                    margin: '0 auto 15px',
                    display: 'block'
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              {/* Business Name */}
              <h2 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: 'black',
                margin: '0',
                lineHeight: '1.2'
              }}>
                {business.name}
              </h2>

              {/* Divider */}
              <div style={{
                height: '2px',
                background: 'black',
                width: '70%'
              }}></div>

              {/* QR Code */}
              <div style={{ 
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '6px solid black'
              }}>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  style={{
                    width: '200px',
                    height: '200px',
                    display: 'block'
                  }}
                />
              </div>

              {/* Divider */}
              <div style={{
                height: '2px',
                background: 'black',
                width: '70%'
              }}></div>

              {/* Tagline */}
              <div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0',
                  color: 'black'
                }}>
                  AI-Powered Reviews
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'black',
                  margin: '0',
                  lineHeight: '1.3'
                }}>
                  Get Authentic 5-Star Reviews Instantly
                </p>
              </div>

              {/* Footer */}
              <p style={{
                fontSize: '12px',
                color: 'black',
                margin: '8px 0 0 0'
              }}>
                Powered by WebTech Solutions
              </p>
            </div>

            <p style={{
              color: '#666',
              fontSize: '16px',
              marginTop: '24px',
              fontWeight: 'bold'
            }}>
              Scan with your phone camera
            </p>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              ⬇️ Download Template
            </button>
            <button
              onClick={() => window.print()}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              🖨️ Print
            </button>
          </div>

          {/* Info Section */}
          <div style={{
            background: '#eff6ff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            border: '2px solid #dbeafe'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              📋 Business Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div style={{
                background: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Business</p>
                <p style={{ fontWeight: 'bold', color: '#3b82f6' }}>{business.name}</p>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Category</p>
                <p style={{ fontWeight: 'bold', color: '#3b82f6' }}>{business.category}</p>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'left',
                gridColumn: '1 / -1'
              }}>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Location</p>
                <p style={{ fontWeight: 'bold', color: '#3b82f6' }}>📍 {business.location}</p>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'left',
                gridColumn: '1 / -1'
              }}>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>AI-Generated Reviews</p>
                <p style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '18px' }}>{business.reviews.length} reviews</p>
              </div>
            </div>
          </div>

          {/* Logo Upload Section */}
          <div style={{
            background: '#fef3c7',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            border: '2px solid #fcd34d'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#92400e',
              marginBottom: '16px'
            }}>
              📸 Upload Company Logo
            </h3>
            
            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `3px dashed ${dragActive ? '#f59e0b' : '#fcd34d'}`,
                borderRadius: '12px',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? '#fffbeb' : '#fffef3',
                transition: 'all 0.3s ease',
                marginBottom: '16px'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <p style={{
                color: '#92400e',
                fontSize: '14px',
                margin: '0 0 8px 0',
                fontWeight: 'bold'
              }}>
                {uploadedLogo ? '✓ Logo uploaded' : 'Drag and drop your logo here'}
              </p>
              <p style={{
                color: '#b45309',
                fontSize: '12px',
                margin: '0'
              }}>
                or click to browse
              </p>
            </div>

            {uploadedLogo && (
              <div style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <img
                    src={uploadedLogo}
                    alt="Logo preview"
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
                    Ready to use
                  </span>
                </div>
                <button
                  onClick={() => setUploadedLogo(null)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
                >
                  Remove
                </button>
              </div>
            )}

            <p style={{
              color: '#b45309',
              fontSize: '13px',
              margin: '0',
              lineHeight: '1.6'
            }}>
              ✓ Recommended size: 200x200px or larger (square format)<br />
              ✓ Format: PNG with transparent background works best
            </p>
          </div>

          {/* How It Works */}
          <div style={{
            background: '#f0fdf4',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #dcfce7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              🚀 How It Works
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              textAlign: 'center'
            }}>
              {[
                { num: '1', text: 'Download the template' },
                { num: '2', text: 'Print or share the QR' },
                { num: '3', text: 'Customer gets 35 reviews' }
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #dcfce7'
                }}>
                  <p style={{
                    background: '#10b981',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontWeight: 'bold'
                  }}>
                    {item.num}
                  </p>
                  <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Link */}
          <div style={{ marginTop: '32px', borderTop: '2px solid #e5e7eb', paddingTop: '24px' }}>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '16px' }}>
              Want to see what customers will experience?
            </p>
            <Link
              href={`/customer/${businessId}`}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '8px',
                fontWeight: 'bold',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              👁️ Preview Customer Page
            </Link>
          </div>
        </div>

        {/* Direct Link */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', marginBottom: '12px', fontSize: '14px' }}>
            Or share this link directly:
          </p>
          <div style={{
            background: '#f3f4f6',
            padding: '12px 16px',
            borderRadius: '8px',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#374151'
          }}>
            {`${baseUrl}/customer/${businessId}`}
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
