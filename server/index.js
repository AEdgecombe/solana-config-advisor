const express = require('express');
const cors = require('cors');
const net = require('net');
const dns = require('dns').promises;
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const BLOCKED_RANGES = [
  /^127\./,                          // loopback
  /^10\./,                           // RFC1918 private
  /^172\.(1[6-9]|2[0-9]|3[01])\./,   // RFC1918 private
  /^192\.168\./,                     // RFC1918 private
  /^169\.254\./,                     // link-local incl. cloud metadata
  /^0\./,                            // "this" network
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i,                         // IPv6 link-local
];

const VALID_HOST_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PORT_PROBE_TIMEOUT_MS = 3000;

const isBlockedIP = (ip) => BLOCKED_RANGES.some((range) => range.test(ip));

const resolveSafeIp = async (host) => {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
  const { address } = await dns.lookup(host);
  return address;
};

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

const buildRpcPayload = (id, method) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id, method })
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API Online' });
});

app.post('/api/rpc-doctor', rpcLimiter, async (req, res) => {
  const { rpcUrl } = req.body;
  
  if (!rpcUrl) {
    return res.status(400).json({ error: 'RPC URL is required' });
  }

  const startTime = Date.now();

  try {
    const [slotRes, healthRes, versionRes, epochRes] = await Promise.all([
      fetch(rpcUrl, buildRpcPayload(1, 'getSlot')),
      fetch(rpcUrl, buildRpcPayload(2, 'getHealth')),
      fetch(rpcUrl, buildRpcPayload(3, 'getVersion')),
      fetch(rpcUrl, buildRpcPayload(4, 'getEpochInfo'))
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
    res.status(500).json({ 
      status: 'Offline', 
      slot: null, 
      latency: Date.now() - startTime, 
      error: 'Failed to connect to endpoint.' 
    });
  }
});

app.post('/api/audit', auditLimiter, async (req, res) => {
  const { targetIp } = req.body;

  if (!targetIp || !VALID_HOST_PATTERN.test(targetIp)) {
    return res.status(400).json({ error: 'Invalid target address format' });
  }

  let resolvedIp;
  try {
    resolvedIp = await resolveSafeIp(targetIp);
  } catch (err) {
    return res.status(400).json({ error: 'Unable to resolve target host' });
  }

  if (isBlockedIP(resolvedIp)) {
    return res.status(403).json({ error: 'Target address is not permitted' });
  }

  const portsToCheck = [
    { port: 8899, name: 'RPC Port', shouldBeOpen: false }, 
    { port: 8900, name: 'PubSub WebSocket', shouldBeOpen: false },
    { port: 8000, name: 'Dynamic Gossip', shouldBeOpen: true }
  ];

  const checkPort = (port, host) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(PORT_PROBE_TIMEOUT_MS);

      socket.on('connect', () => {
        socket.destroy();
        resolve({ port, status: 'OPEN', vulnerable: true });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ port, status: 'FILTERED', vulnerable: false });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({ port, status: 'CLOSED', vulnerable: false });
      });

      socket.connect(port, host);
    });
  };

  try {
    const results = await Promise.all(
      portsToCheck.map(async (p) => {
        const scanResult = await checkPort(p.port, resolvedIp);
        return { ...p, ...scanResult };
      })
    );
    
    const vulnerabilities = results.filter(r => r.vulnerable && !r.shouldBeOpen).length;
    const score = Math.max(0, 100 - (vulnerabilities * 40));
    
    res.json({ 
      target: targetIp, 
      score: score, 
      ports: results, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete security audit.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));