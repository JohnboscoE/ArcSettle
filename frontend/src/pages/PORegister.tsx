import React, { useEffect, useState } from 'react';
import { posApi } from '../api';
import { PurchaseOrder } from '../types';
import { Card, EmptyState, Spinner } from '../components/ui';

const PORegister: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    posApi.list().then(res => setPos(res.data.purchaseOrders ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 40, color: 'var(--text-3)' }}>
      <Spinner /> Loading PO register…
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>PO Register</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>
          {pos.length} open purchase orders · the agent matches each invoice against this register
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {pos.length === 0
          ? <Card><EmptyState message="No purchase orders" /></Card>
          : pos.map(po => (
            <Card key={po.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: 3 }}>{po.id}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{po.supplierName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{po.description}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>
                    ${po.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{po.currency} · due {po.dueDate}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '0.5px solid var(--border-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: po.deliveryConfirmed ? 'var(--success)' : 'var(--danger)',
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    Delivery {po.deliveryConfirmed ? 'confirmed' : 'pending'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  Supplier ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{po.supplierId}</span>
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  );
};

export default PORegister;
