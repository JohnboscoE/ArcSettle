import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

// ERC-8004 contracts on Arc Testnet
const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e';
const REPUTATION_REGISTRY = '0x8004B663056A597Dffe9eCcC1965A193B7388713';

// ArcSettle agent metadata
const AGENT_METADATA_URI = 'ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei';

async function pollTransaction(txId: string, label: string): Promise<string> {
  console.log(`  Waiting for ${label}...`);
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const { data } = await client.getTransaction({ id: txId });
    const transaction = data?.transaction;
    const state = transaction?.state;
    if (state === 'COMPLETE') return transaction?.txHash ?? '';
    if (state === 'FAILED') throw new Error(`Transaction failed: ${label}`);
  }
  throw new Error(`Timeout: ${label}`);
}

async function main() {
  console.log('=== ArcSettle Agent Registration (ERC-8004) ===\n');

  // Load wallet config
  const configPath = path.join(__dirname, '../../wallets.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('wallets.json not found. Run npm run setup-wallets first.');
  }
  const walletConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const buyerAddress = walletConfig.buyer.address;

  console.log(`Registering ArcSettle agent from wallet: ${buyerAddress}`);
  console.log(`Metadata URI: ${AGENT_METADATA_URI}\n`);

  // Register agent identity on ERC-8004
  const registerRes = await client.createContractExecutionTransaction({
    walletAddress: buyerAddress,
    blockchain: 'ARC-TESTNET',
    contractAddress: IDENTITY_REGISTRY,
    abiFunctionSignature: 'register(string)',
    abiParameters: [AGENT_METADATA_URI],
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
  });

  const registerId = registerRes.data?.id;
  if (!registerId) throw new Error('Failed to submit registration transaction');

  const registerHash = await pollTransaction(registerId, 'agent registration');
  console.log(`Agent registered on Arc!`);
  console.log(`  TX: https://testnet.arcscan.app/tx/${registerHash}\n`);

  // Save registration info
  walletConfig.agentRegistration = {
    txHash: registerHash,
    metadataUri: AGENT_METADATA_URI,
    registeredAt: new Date().toISOString(),
  };
  fs.writeFileSync(configPath, JSON.stringify(walletConfig, null, 2));

  console.log('Agent registration saved to wallets.json');
  console.log('\nArcSettle agent now has onchain identity on Arc Testnet.');
  console.log('Next: npm run dev to start the backend with full Circle integration.');
}

main().catch(err => {
  console.error('Registration failed:', err.message ?? err);
  process.exit(1);
});