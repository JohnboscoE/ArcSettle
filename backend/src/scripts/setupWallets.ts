import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

const SUPPLIERS = [
  { id: 'sup-001', name: 'AlMansoori Industrial Supply' },
  { id: 'sup-002', name: 'Nile Tech Components' },
  { id: 'sup-003', name: 'Lagos Freight & Logistics' },
  { id: 'sup-004', name: 'Karachi Steel Works' },
  { id: 'sup-005', name: 'Riyadh Office Supplies Co.' },
];

async function main() {
  console.log('=== ArcSettle Wallet Setup ===\n');

  console.log('Creating wallet set...');
  const walletSetRes = await client.createWalletSet({
    name: 'ArcSettle Wallet Set',
  });
  const walletSetId = walletSetRes.data?.walletSet?.id;
  if (!walletSetId) throw new Error('Failed to create wallet set');
  console.log(`Wallet set ID: ${walletSetId}\n`);

  console.log('Creating 6 wallets (1 buyer + 5 suppliers)...');
  const walletsRes = await client.createWallets({
    walletSetId,
   blockchains: ['ARC-TESTNET' as any],
    count: 6,
    accountType: 'SCA',
  });

  const wallets = walletsRes.data?.wallets ?? [];
  if (wallets.length < 6) throw new Error('Not enough wallets created');

  const buyerWallet = wallets[0];
  const supplierWallets = wallets.slice(1);

  console.log(`Buyer wallet:`);
  console.log(`  ID:      ${buyerWallet.id}`);
  console.log(`  Address: ${buyerWallet.address}`);

  console.log(`\nSupplier wallets:`);
  const supplierMap: Record<string, { id: string; address: string }> = {};
  supplierWallets.forEach((w, i) => {
    const supplier = SUPPLIERS[i];
    supplierMap[supplier.id] = { id: w.id!, address: w.address! };
    console.log(`  ${supplier.name}: ${w.address}`);
  });

  const walletConfig = {
    walletSetId,
    buyer: { id: buyerWallet.id, address: buyerWallet.address },
    suppliers: supplierMap,
    createdAt: new Date().toISOString(),
  };

  const configPath = path.join(__dirname, '../../wallets.json');
  fs.writeFileSync(configPath, JSON.stringify(walletConfig, null, 2));
  console.log(`\nWallet config saved to wallets.json`);
  console.log('\n=== NEXT STEP ===');
  console.log(`Fund buyer wallet at: https://faucet.circle.com`);
  console.log(`Buyer address: ${buyerWallet.address}`);
  console.log(`Then run: npm run register-agent`);
}

main().catch(err => {
  console.error('Setup failed:', err.message ?? err);
  process.exit(1);
});