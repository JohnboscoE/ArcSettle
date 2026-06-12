import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import invoiceRoutes from './routes/invoices';
import posRoutes from './routes/pos';
import dashboardRoutes from './routes/dashboard';
import agentRoutes from './routes/agent';
import settlementRoutes from './routes/settlement';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

// Allow both production Vercel frontend and local development
const allowedOrigins = [
  'https://arc-settle-seven.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = `The CORS policy for this site does not allow access from origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/api/invoices', invoiceRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/settlement', settlementRoutes);

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  agentRegistered: fs.existsSync(path.join(__dirname, '../wallets.json')),
}));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.stdin.resume();
process.on('SIGINT', () => process.exit(0));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`ArcSettle backend running on port ${PORT}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

export default app;