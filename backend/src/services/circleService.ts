import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SettlementRecord, AgentLog, Invoice } from '../types';
import { db } from '../data/store';

dotenv.config();

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

// USDC contract on Arc Testnet
const USDC_CONTRACT = '0x3600000000000000000000000000000000000000';

function loadWalletConfig() {
  const configPath = path.join(__dirname, '../../wallets.json');
  if (!fs.existsSync(configPath)) throw new Error('wallets.json not found. Run npm run setup-wallets first.');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

async function pollTransaction(txId: string, label: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise(r => setTimeout(r, 2000));
      const { data } = await client.getTransaction({ id: txId });
      const transaction = data?.transaction;
      const state = transaction?.state;
      console.log(`  [${label}] attempt ${i+1}: ${state}`);
      if (state === 'COMPLETE') return transaction?.txHash ?? '';
      if (state === 'FAILED') throw new Error(`Transaction failed: ${label}`);
    } catch (err) {
      console.error(`  [${label}] poll error:`, err);
      throw err;
    }
  }
  throw new Error(`Timeout waiting for: ${label}`);
}

function toUsdcUnits(usdAmount: number): string {
  return Math.floor(usdAmount * 1_000_000).toString();
}

export async function settleInvoiceOnChain(
  invoice: Invoice,
  agentLog: AgentLog
): Promise<SettlementRecord> {
  const walletConfig = loadWalletConfig();
  const buyerWalletId = walletConfig.buyer.id;
  const buyerAddress = walletConfig.buyer.address;
  const supplierWallet = walletConfig.suppliers[invoice.supplierId];

  if (!supplierWallet) throw new Error(`No wallet found for supplier ${invoice.supplierId}`);

  const amountUnits = toUsdcUnits(agentLog.amountToSettle);

  console.log(`\nSettling invoice ${invoice.invoiceNumber} on Arc...`);
  console.log(`  Amount: $${agentLog.amountToSettle} USDC`);
  console.log(`  Supplier: ${supplierWallet.address}`);

  // Direct USDC transfer — buyer wallet sends to supplier wallet
  // This is simpler, gas-efficient, and avoids supplier wallet needing gas
  console.log('  Executing USDC transfer via Circle Wallets...');
const transferRes = await client.createContractExecutionTransaction({
  walletId: buyerWalletId,
  contractAddress: USDC_CONTRACT,
  abiFunctionSignature: 'transfer(address,uint256)',
  abiParameters: [
    supplierWallet.address,
    Math.floor(agentLog.amountToSettle * 1_000_000).toString(),
  ],
  fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
});

const transferId = transferRes.data?.id;
if (!transferId) throw new Error('Failed to create transfer transaction');

  const txHash = await pollTransaction(transferId, 'USDC transfer');
  console.log(`  Transfer complete: https://testnet.arcscan.app/tx/${txHash}`);

  const settlement: SettlementRecord = {
    id: uuidv4(),
    invoiceId: invoice.id,
    agentLogId: agentLog.id,
    supplierWallet: supplierWallet.address,
    buyerWallet: buyerAddress,
    amountUsdc: agentLog.amountToSettle,
    txHash,
    settledAt: new Date().toISOString(),
    status: 'success',
  };

  db.addSettlement(settlement);
  db.updateInvoice(invoice.id, { status: 'paid' });
  agentLog.onChainTxHash = txHash;

  return settlement;
}

export async function getWalletBalance(walletId: string): Promise<number> {
  try {
    const res = await client.getWalletTokenBalance({ id: walletId });
    const tokenBalances = res.data?.tokenBalances ?? [];
    const usdc = tokenBalances.find((t: any) =>
      t.token?.symbol === 'USDC' && t.token?.blockchain === 'ARC-TESTNET'
    );
    return parseFloat(usdc?.amount ?? '0');
  } catch {
    return 0;
  }
}
