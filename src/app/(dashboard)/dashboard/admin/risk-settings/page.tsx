'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

type Settings = {
  weights?: {
    components?: { covenant?: number; trend?: number; abs?: number; maturity?: number; size?: number; scale?: number };
    covenant?: { liquidity?: number; solvency?: number; profitability?: number; efficiency?: number };
  };
  targets?: Record<string, number>;
};

export default function RiskSettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({});

  const role = (session?.user as any)?.userType || 'admin';

  useEffect(() => {
    if (status === 'loading') return;
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/admin/risk-settings');
        if (!res.ok) {
          const msg = res.status === 403 ? 'Super admin only' : 'Failed to load settings';
          setError(msg);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSettings(data?.settings || {});
      } catch (e) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [status]);

  const get = <T,>(path: (Settings | any), keys: string[], fallback: T): T => {
    let cur: any = path;
    for (const k of keys) {
      cur = (cur && typeof cur === 'object') ? cur[k] : undefined;
    }
    return (cur ?? fallback) as T;
  };

  const setPath = (keys: string[], value: any) => {
    setSettings(prev => {
      const clone: any = JSON.parse(JSON.stringify(prev || {}));
      let cur: any = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const num = (n: any) => {
    const v = Number(n);
    return Number.isFinite(v) ? v : 0;
  };

  // System defaults
  const DEFAULT_COMPONENT_WEIGHTS: Record<string, number> = {
    covenant: 0.5,
    trend: 0.2,
    abs: 0.1,
    maturity: 0.1,
    size: 0.05,
    scale: 0.05
  };

  const DEFAULT_COVENANT_WEIGHTS: Record<string, number> = {
    liquidity: 0.25,
    solvency: 0.3,
    profitability: 0.3,
    efficiency: 0.15
  };

  const DEFAULT_TARGETS: Record<string, number> = {
    current_ratio: 88,
    quick_ratio: 1,
    debt_ratio: 40,
    equity_ratio: 60,
    quasi_equity_ratio: 15,
    capitalisation_ratio: 123,
    interest_cover: 3,
    receivables_turnover: 2,
    inventory_turnover: 2,
    creditors_turnover: 2,
    avg_collection_period: 30,
    avg_payment_period: 45,
    inventory_turnover_days: 50,
    operating_cycle: 30,
    gross_profit_margin: 40,
    net_profit_margin: 15,
    return_on_total_assets: 8
  };

  const RATIO_CATEGORY: Record<string, string> = {
    // Liquidity
    current_ratio: 'liquidity',
    quick_ratio: 'liquidity',
    // Solvency
    debt_ratio: 'solvency',
    equity_ratio: 'solvency',
    quasi_equity_ratio: 'solvency',
    capitalisation_ratio: 'solvency',
    interest_cover: 'solvency',
    // Efficiency & Working-Capital
    receivables_turnover: 'efficiency',
    inventory_turnover: 'efficiency',
    creditors_turnover: 'efficiency',
    avg_collection_period: 'efficiency',
    avg_payment_period: 'efficiency',
    inventory_turnover_days: 'efficiency',
    operating_cycle: 'efficiency',
    // Profitability
    gross_profit_margin: 'profitability',
    net_profit_margin: 'profitability',
    return_on_total_assets: 'profitability'
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/risk-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (!res.ok) {
        setError('Failed to save');
        return;
      }
    } catch {
      setError('Network error saving');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session?.user) return <div>Unauthorized</div>;

  return (
    <DashboardLayout role={role} activeTab={'admin'} setActiveTab={() => {}}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Risk Settings (Super Admin)</h1>
        <p style={{ color: '#8a8a8a', marginBottom: 16 }}>Tune weights and thresholds. Changes affect risk scoring immediately.</p>
        {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
        {loading ? (
          <div>Loading settings…</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <section style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 16 }}>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Component Weights</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {['covenant','trend','abs','maturity','size','scale'].map(key => (
                  <label key={key} style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#a0a0a0', textTransform: 'capitalize' }}>{key}</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="(leave blank for default)"
                      value={get<number | string>(settings, ['weights','components',key], '') as any}
                      onChange={e => {
                        const val = e.target.value;
                        setSettings(prev => {
                          const clone: any = JSON.parse(JSON.stringify(prev || {}));
                          clone.weights = clone.weights || {}; clone.weights.components = clone.weights.components || {};
                          if (val === '') {
                            delete clone.weights.components[key];
                          } else {
                            clone.weights.components[key] = num(val);
                          }
                          return clone;
                        });
                      }}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    />
                    <span style={{ fontSize: 11, color: '#777' }}>Default: {Math.round(DEFAULT_COMPONENT_WEIGHTS[key]*100)}%</span>
                  </label>
                ))}
              </div>
              <p style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0' }}>Tip: Weights should sum to 100% (we auto-normalize if not exact).</p>
            </section>

            <section style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 16 }}>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Covenant Sub-Weights</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {[
                  ['liquidity','Liquidity'],
                  ['solvency','Solvency'],
                  ['profitability','Profitability'],
                  ['efficiency','Efficiency']
                ].map(([k, label]) => (
                  <label key={k} style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#a0a0a0' }}>{label}</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="(leave blank for default)"
                      value={get<number | string>(settings, ['weights','covenant',k], '') as any}
                      onChange={e => {
                        const val = e.target.value;
                        setSettings(prev => {
                          const clone: any = JSON.parse(JSON.stringify(prev || {}));
                          clone.weights = clone.weights || {}; clone.weights.covenant = clone.weights.covenant || {};
                          if (val === '') {
                            delete clone.weights.covenant[k];
                          } else {
                            clone.weights.covenant[k] = num(val);
                          }
                          return clone;
                        });
                      }}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    />
                    <span style={{ fontSize: 11, color: '#777' }}>Default: {Math.round(DEFAULT_COVENANT_WEIGHTS[k]*100)}%</span>
                  </label>
                ))}
              </div>
            </section>

            <section style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 16 }}>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Ratio Targets</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  'current_ratio','quick_ratio','debt_ratio','equity_ratio','quasi_equity_ratio','capitalisation_ratio','interest_cover',
                  'receivables_turnover','inventory_turnover','creditors_turnover','avg_collection_period','avg_payment_period','inventory_turnover_days','operating_cycle',
                  'gross_profit_margin','net_profit_margin','return_on_total_assets'
                ].map(key => (
                  <label key={key} style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#a0a0a0' }}>{`${key.replace(/_/g,' ')} (${RATIO_CATEGORY[key] || '-'})`}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={get<number | string>(settings, ['targets', key], '') as any}
                      onChange={e => {
                        const val = e.target.value;
                        setSettings(prev => {
                          const clone: any = JSON.parse(JSON.stringify(prev || {}));
                          clone.targets = clone.targets || {};
                          if (val === '') {
                            delete clone.targets[key];
                          } else {
                            clone.targets[key] = num(val);
                          }
                          return clone;
                        });
                      }}
                      placeholder="(leave blank for default)"
                      style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    />
                    <span style={{ fontSize: 11, color: '#777' }}>Default: {DEFAULT_TARGETS[key] ?? '-'}</span>
                  </label>
                ))}
              </div>
              <p style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0' }}>Leave blank to use the system default target for that metric.</p>
            </section>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={save} disabled={saving} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: '#3b82f6', color: 'white', fontWeight: 600 }}>
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


