<div align="center">

# ⬡ Nodex

**High Fidelity Validator Diagnostics & Telemetry**

[![Live Demo](https://img.shields.io/badge/Live_Demo-06B6D4?style=for-the-badge)](https://solana-config-advisor.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-1f6feb?style=for-the-badge)](./LICENSE)

![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

> An automated diagnostic suite for Solana node operators, engineered for the 400ms block-production era of the Agave client.

<br>

<a href="https://solana-config-advisor.vercel.app/">
  <img src="./assets/landing-preview.png" alt="Nodex Platform Preview" width="850">
</a>

</div>

<br>

## Overview

Nodex evaluates bare-metal architecture against Mainnet Beta constraints and monitors live endpoint performance to help operators avoid validator delinquency. The interface is divided into two top-level views:

* **Hardware Procurement Advisor** — Scores a proposed architecture against Solana's mainnet hardware requirements, surfaces configuration pitfalls (e.g. NVMe IOPS throttling on cloud VPS), and dynamically compiles an `agave-validator` startup script tailored to the inputs.
* **Network Telemetry** — Benchmarks a custom RPC endpoint against the public Mainnet Beta baseline using concurrent JSON-RPC 2.0 calls, with high-frequency latency rendered through Recharts. The Telemetry view also exposes a **Port Vulnerability Auditor** that performs asynchronous TCP handshakes via the Node `net` module to verify that RPC and PubSub ports are properly firewalled.

<br>

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local development

```bash
git clone https://github.com/AEdgecombe/Nodex.git
cd Nodex

# Backend
cd server
cp .env.example .env
npm install
npm run dev          # http://localhost:5000

# Frontend (in a second terminal)
cd ../client
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

### Tests

```bash
# Backend — route, SSRF and RPC shape integration tests (Jest + Supertest)
cd server && npm test

# Frontend — component and boundary-value tests (Vitest + Testing Library)
cd client && npm test
```

<br>

## Architecture & Security

Nodex is a React + Express + Node.js application. Because the auditor opens TCP sockets and the diagnostic endpoint proxies arbitrary RPC URLs, defensive controls are layered through the API gateway so the public service cannot be repurposed as an attack tool:

* **Rate limiting** — `express-rate-limit` caps RPC diagnostics at 30/min and security audits at 3/min per source IP.
* **CORS allow-list** — only the production Vercel origin and local development ports are accepted; the list is configurable via the `ALLOWED_ORIGINS` environment variable.
* **SSRF protection** — submitted hostnames are DNS-resolved on the server and checked against an RFC1918 + link-local + loopback blocklist before any socket is opened, preventing internal network probing through the public auditor.
* **Bounded I/O** — outbound RPC `fetch` calls are wrapped in an `AbortController` with a 5-second timeout; TCP probes use an explicit 3-second socket timeout so a slow target cannot stall the event loop.
* **UI cooldowns** — the auditor button enforces a 20-second client-side cooldown on top of the backend rate limit.

### Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind v4, Recharts | Responsive SPA with state management and SVG data visualisation. |
| **Backend** | Node.js, Express, `net`, `dns` | API routing, concurrent JSON-RPC fetches, TCP probing, hostname resolution. |
| **Security** | express-rate-limit, SSRF blocklist, CORS allow-list, AbortController | Layered defence against floods, hangs, and internal-network probes. |
| **Testing** | Vitest, Jest, Supertest | Component DOM verification, boundary-value tests, route and SSRF integration tests. |

<br>

## Deployment

The frontend is built into static assets and distributed globally via the Vercel CDN. The Node.js API gateway runs as a long-lived web service on Render. The backend is fully stateless — sensitive node telemetry is never persisted — and the two tiers are decoupled so each can scale and redeploy independently.
