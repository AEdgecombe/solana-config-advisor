<div align="center">

# ⬡ Nodex

**High Fidelity Validator Diagnostics & Telemetry**

[![Live Demo](https://img.shields.io/badge/Live_Demo-06B6D4?style=for-the-badge)](https://solana-config-advisor.vercel.app/)

![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

> An automated diagnostic suite for Solana node operators, engineered specifically for the 400ms block production era of the Agave client.

<br>

<a href="https://solana-config-advisor.vercel.app/">
  <img src="./assets/landing-preview.png" alt="Nodex Platform Preview" width="850">
</a>

</div>

<br>

## System Overview

Nodex evaluates bare metal architecture against Mainnet Beta constraints and monitors live endpoint performance to prevent validator delinquency. The platform is divided into three core modules:

* **Hardware Procurement Advisor:** Evaluates proposed architecture, detects configuration pitfalls (e.g., NVMe IOPS throttling), and dynamically compiles an optimised `agave-validator` bash startup script.
* **Network Telemetry:** Benchmarks custom endpoints against public baselines simultaneously using concurrent JSON RPC 2.0 requests. Visualises high frequency latency data via Recharts.
* **DDoS Vulnerability Auditor:** Executes asynchronous TCP handshakes against target IP addresses via the Node.js `net` module to probe RPC and PubSub ports, verifying strict firewall integrity.

<br>

## Architecture & Security

The application utilises a React, Express, and Node.js architecture. To satisfy strict non functional security requirements and protect public infrastructure, Express middleware enforces stringent backend rate limiting, while React manages UI cooldowns. This comprehensively mitigates the risk of inadvertent network flooding during active penetration testing.

### Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind v4, Recharts | Responsive SPA with complex state management and SVG data visualisation. |
| **Backend** | Node.js, Express, Net | API routing, concurrent request handling, and TCP socket generation. |
| **Security** | express-rate-limit | Strict request throttling to protect public Solana nodes. |
| **Testing** | Vitest, Jest, Supertest | Automated client DOM verification and backend route validation. |

<br>

## Cloud Deployment Architecture

The platform abandons monolithic hosting in favour of a decoupled serverless architecture. The React application is compiled into static assets and distributed globally via the Vercel CDN. The Node.js API gateway operates as an isolated web service on Render. This backend handles all TCP socket generation and RPC routing securely behind restrictive CORS policies, operating entirely statelessly to ensure sensitive node telemetry is never retained.