import { Supplier, PurchaseOrder } from '../types';

export const suppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'AlMansoori Industrial Supply',
    walletAddress: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
    country: 'UAE',
    currency: 'USD',
    reliabilityScore: 92,
  },
  {
    id: 'sup-002',
    name: 'Nile Tech Components',
    walletAddress: '0xB2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3',
    country: 'Egypt',
    currency: 'USD',
    reliabilityScore: 78,
  },
  {
    id: 'sup-003',
    name: 'Lagos Freight & Logistics',
    walletAddress: '0xC3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4',
    country: 'Nigeria',
    currency: 'USD',
    reliabilityScore: 85,
  },
  {
    id: 'sup-004',
    name: 'Karachi Steel Works',
    walletAddress: '0xD4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5',
    country: 'Pakistan',
    currency: 'USD',
    reliabilityScore: 70,
  },
  {
    id: 'sup-005',
    name: 'Riyadh Office Supplies Co.',
    walletAddress: '0xE5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6',
    country: 'Saudi Arabia',
    currency: 'USD',
    reliabilityScore: 95,
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  // Clean match scenario
  {
    id: 'PO-2026-001',
    supplierId: 'sup-001',
    supplierName: 'AlMansoori Industrial Supply',
    amount: 25,
    currency: 'USD',
    description: 'Industrial valve assembly units x50',
    issuedDate: '2026-05-01',
    dueDate: '2026-06-30',
    deliveryConfirmed: true,
    items: [
      { description: 'Valve assembly unit', quantity: 50, unitPrice: 250.00, total: 25},
    ],
  },
  // Partial shipment scenario — invoice will be for 80% of PO
  {
    id: 'PO-2026-002',
    supplierId: 'sup-002',
    supplierName: 'Nile Tech Components',
    amount: 20,
    currency: 'USD',
    description: 'PCB circuit boards batch order',
    issuedDate: '2026-05-10',
    dueDate: '2026-07-01',
    deliveryConfirmed: true,
    items: [
      { description: 'PCB circuit board - Type A', quantity: 200, unitPrice: 28.00, total: 20 },
      { description: 'PCB circuit board - Type B', quantity: 100, unitPrice: 28.00, total: 20 },
    ],
  },
  // Amount discrepancy — invoice will have FX rounding issue
  {
    id: 'PO-2026-003',
    supplierId: 'sup-003',
    supplierName: 'Lagos Freight & Logistics',
    amount: 15,
    currency: 'USD',
    description: 'Freight forwarding services Q2',
    issuedDate: '2026-05-15',
    dueDate: '2026-06-15',
    deliveryConfirmed: true,
    items: [
      { description: 'Air freight - Lagos to Dubai', quantity: 1, unitPrice: 2200.00, total: 15 },
      { description: 'Customs clearance fees', quantity: 1, unitPrice: 1550.00, total: 15 },
    ],
  },
  // Duplicate invoice scenario — this PO will get invoiced twice
  {
    id: 'PO-2026-004',
    supplierId: 'sup-004',
    supplierName: 'Karachi Steel Works',
    amount: 30,
    currency: 'USD',
    description: 'Steel rebar supply - construction project',
    issuedDate: '2026-04-20',
    dueDate: '2026-06-20',
    deliveryConfirmed: true,
    items: [
      { description: 'Steel rebar 12mm - 10 tonnes', quantity: 10, unitPrice: 1400.00, total: 30 },
      { description: 'Steel rebar 16mm - 5 tonnes', quantity: 5, unitPrice: 1600.00, total: 30 },
    ],
  },
  // Disputed delivery — delivery not yet confirmed
  {
    id: 'PO-2026-005',
    supplierId: 'sup-005',
    supplierName: 'Riyadh Office Supplies Co.',
    amount: 18,
    currency: 'USD',
    description: 'Office furniture and supplies',
    issuedDate: '2026-05-20',
    dueDate: '2026-07-05',
    deliveryConfirmed: false, // delivery not confirmed — agent should hold
    items: [
      { description: 'Ergonomic office chairs x20', quantity: 20, unitPrice: 180.00, total: 18 },
      { description: 'Standing desks x2', quantity: 2, unitPrice: 300.00, total: 18 },
    ],
  },
];
