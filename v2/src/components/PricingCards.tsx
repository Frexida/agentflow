'use client';

import { useState } from 'react';
import { PLANS } from '@/lib/stripe';

interface PricingCardsProps {
  currentPlan?: string;
}

export function PricingCards({ currentPlan = 'free' }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('manage');
    try {
      const res = await fetch('/api/billing', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-grid">
      {/* Free */}
      <div className={`pricing-card ${currentPlan === 'free' ? 'current' : ''}`}>
        <h3>Free</h3>
        <div className="price">$0<span>/mo</span></div>
        <ul>
          <li>3 designs</li>
          <li>Local save only</li>
          <li>Demo mode</li>
        </ul>
        {currentPlan === 'free' && <div className="badge">Current Plan</div>}
      </div>

      {/* Pro */}
      <div className={`pricing-card featured ${currentPlan === 'pro' ? 'current' : ''}`}>
        <h3>Pro</h3>
        <div className="price">$19<span>/mo</span></div>
        <ul>
          {(['Unlimited designs', 'Cloud save', 'Gateway hosting (1 instance)', 'Priority support'] as const).map(f => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {currentPlan === 'pro' ? (
          <button onClick={handleManage} disabled={loading === 'manage'}>
            {loading === 'manage' ? 'Loading...' : 'Manage Subscription'}
          </button>
        ) : (
          <button onClick={() => handleUpgrade('pro')} disabled={loading === 'pro'}>
            {loading === 'pro' ? 'Loading...' : 'Upgrade to Pro'}
          </button>
        )}
      </div>

      {/* Team */}
      <div className={`pricing-card ${currentPlan === 'team' ? 'current' : ''}`}>
        <h3>Team</h3>
        <div className="price">$49<span>/mo</span></div>
        <ul>
          {(['Everything in Pro', 'Up to 5 team members', 'Gateway hosting (3 instances)', 'Shared designs', 'Team management'] as const).map(f => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {currentPlan === 'team' ? (
          <button onClick={handleManage} disabled={loading === 'manage'}>
            {loading === 'manage' ? 'Loading...' : 'Manage Subscription'}
          </button>
        ) : (
          <button onClick={() => handleUpgrade('team')} disabled={loading === 'team'}>
            {loading === 'team' ? 'Loading...' : 'Upgrade to Team'}
          </button>
        )}
      </div>

      <style jsx>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .pricing-card {
          background: var(--surface-elevated, #141414);
          border: 1px solid var(--border, #2a2a2a);
          border-radius: 12px;
          padding: 32px 24px;
          text-align: center;
        }
        .pricing-card.featured {
          border-color: var(--accent-bright, #e94560);
          position: relative;
        }
        .pricing-card.current {
          border-color: var(--accent-bright, #e94560);
          box-shadow: 0 0 20px rgba(233, 69, 96, 0.2);
        }
        h3 {
          font-size: 1.25rem;
          margin-bottom: 8px;
          color: var(--text-primary, #f0f0f0);
        }
        .price {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--accent-bright, #e94560);
          margin-bottom: 24px;
        }
        .price span {
          font-size: 1rem;
          color: var(--text-secondary, #888);
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
        }
        li {
          padding: 8px 0;
          color: var(--text-secondary, #888);
          border-bottom: 1px solid var(--border, #2a2a2a);
        }
        li:last-child {
          border-bottom: none;
        }
        button {
          width: 100%;
          padding: 12px;
          background: var(--accent-bright, #e94560);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        button:hover {
          opacity: 0.9;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .badge {
          background: var(--accent, #3a1520);
          color: var(--accent-bright, #e94560);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          margin-top: 16px;
          display: inline-block;
        }
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
