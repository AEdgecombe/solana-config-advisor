const request = require('supertest');
const app = require('./index');

describe('Solana Ops Suite API', () => {

  it('should return a 404 for undefined routes', async () => {
    const res = await request(app).get('/api/nonsense-route');
    expect(res.statusCode).toBe(404);
  });

  it('should return an ok status from the health endpoint', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should block audit requests missing a target IP', async () => {
    const res = await request(app)
      .post('/api/audit')
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it('should return latency and slot data for a valid RPC endpoint', async () => {
    const res = await request(app)
      .post('/api/rpc-doctor')
      .send({ rpcUrl: 'https://api.mainnet-beta.solana.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('latency');
    expect(res.body).toHaveProperty('slot');
    expect(typeof res.body.latency).toBe('number');
  }, 15000);

  it('should return a non-2xx error for an invalid RPC endpoint', async () => {
    const res = await request(app)
      .post('/api/rpc-doctor')
      .send({ rpcUrl: 'http://not-a-real-endpoint.invalid' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(600);
  }, 15000);

  it('should refuse to scan a private IP address', async () => {
    const res = await request(app)
      .post('/api/audit')
      .send({ targetIp: '192.168.1.1' });

    expect(res.statusCode).toBe(403);
  });
});
