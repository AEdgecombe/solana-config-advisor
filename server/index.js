const express = require('express');
const cors = require('cors');
const net = require('net');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const rpcLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, 
  message: { error: 'Too many RPC queries. Please wait 60 seconds.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const auditLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3, 
  message: { error: 'Security scans are limited to 3 per minute to prevent IP bans.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API Online' });
});

app.post('/api/rpc-doctor', rpcLimiter, async (req, res) => {
  const { rpcUrl } = req.body;
  if (!rpcUrl) return res.status(400).json({ error: 'RPC URL is required' });

  const startTime = Date.now();
  try {
    const [slotRes, healthRes, versionRes, epochRes] = await Promise.all([
      fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot' }) }),
      fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getHealth' }) }),
      fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'getVersion' }) }),
      fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'getEpochInfo' }) })
    ]);

    const slotData = await slotRes.json();
    const healthData = await healthRes.json();
    const versionData = await versionRes.json();
    const epochData = await epochRes.json();

    res.json({
      status: healthData.result === 'ok' ? 'Healthy' : 'Degraded',
      slot: slotData.result,
      version: versionData.result ? versionData.result['solana-core'] : 'Unknown',
      epoch: epochData.result ? epochData.result.epoch : 'N/A',
      latency: Date.now() - startTime,
      timestamp: new Date().toLocaleTimeString(),
      message: 'Diagnostics completed.'
    });
  } catch (error) {
    res.status(500).json({ status: 'Offline', slot: null, latency: Date.now() - startTime, error: 'Failed to connect to endpoint.' });
  }
});

app.post('/api/audit', auditLimiter, async (req, res) => {
  const { targetIp } = req.body;
  if (!targetIp) return res.status(400).json({ error: 'Target Host is required' });

  const portsToCheck = [
    { port: 8899, name: 'RPC Port', shouldBeOpen: false }, 
    { port: 8900, name: 'PubSub WebSocket', shouldBeOpen: false },
    { port: 8000, name: 'Dynamic Gossip', shouldBeOpen: true }
  ];

  const checkPort = (port, host) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500);
      socket.on('connect', () => { socket.destroy(); resolve({ port, status: 'OPEN', vulnerable: true }); });
      socket.on('timeout', () => { socket.destroy(); resolve({ port, status: 'FILTERED', vulnerable: false }); });
      socket.on('error', () => { resolve({ port, status: 'CLOSED', vulnerable: false }); });
      socket.connect(port, host);
    });
  };

  try {
    const results = await Promise.all(portsToCheck.map(async (p) => {
      const scanResult = await checkPort(p.port, targetIp);
      return { ...p, ...scanResult };
    }));
    const vulnerabilities = results.filter(r => r.vulnerable && !r.shouldBeOpen).length;
    let score = 100 - (vulnerabilities * 40);
    res.json({ target: targetIp, score: Math.max(0, score), ports: results, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete security audit.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));