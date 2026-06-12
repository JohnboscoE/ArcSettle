import React, { useEffect, useState } from 'react';
import { posApi } from '../api';
import { PurchaseOrder } from '../types';
import { Card, EmptyState, Spinner, PageHeader } from '../components/ui';

const PORegister: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    posApi.list().then(res => setPos(res.data.purchaseOrders ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 p-10 text-t3"><Spinner /> Loading PO register…</div>
  );

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="PO Register"
        sub={`${pos.length} open purchase orders · agent matches each invoice against this register`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pos.length === 0
          ? <Card><EmptyState message="No purchase orders" /></Card>
          : pos.map(po => (
            <Card key={po.id}>
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 mr-3">
                  <div className="text-xs font-mono text-accent mb-0.5">{po.id}</div>
                  <div className="text-sm font-medium text-t1 truncate">{po.supplierName}</div>
                  <div className="text-xs text-t3 mt-0.5 line-clamp-2">{po.description}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-semibold font-mono text-t1">${po.amount.toLocaleString()}</div>
                  <div className="text-[11px] text-t3 mt-0.5">{po.currency} · due {po.dueDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${po.deliveryConfirmed ? 'bg-success' : 'bg-danger'}`} />
                  <span className="text-xs text-t3">Delivery {po.deliveryConfirmed ? 'confirmed' : 'pending'}</span>
                </div>
                <span className="text-xs text-t3 font-mono">{po.supplierId}</span>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  );
};

export default PORegister;
