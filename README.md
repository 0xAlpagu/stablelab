[README.md](https://github.com/user-attachments/files/30856981/README.md)
# StableLab

A suite of stablecoin-native DeFi and payment tools deployed on Arc Testnet, built entirely on real Arc-issued assets: USDC, EURC, and cirBTC.

**Live app:** https://stablelabs.vercel.app
**GitHub Pages mirror:** https://0xalpagu.github.io/stablelab/

## Overview

StableLab is a suite of eight interoperable modules spanning core DeFi primitives and treasury/payment tools. Each module is an independent, standalone smart contract; they are not wired together through a shared settlement or accounting layer. They are best thought of as a coordinated set of tools built on the same asset base (USDC, EURC, cirBTC) rather than a single unified system.

The project demonstrates what Arc's stablecoin-optimized infrastructure can support when you build across the full stack Circle provides: USDC as the settlement asset, CCTP for cross-chain liquidity, Gateway for unified balances, and Circle Wallets for onboarding.

## Modules

### DeFi

**Staking**
USDC deposits accrue a continuous, per-second reward with no lockup period. Principal and reward are withdrawn together at any time.

**Lending**
Borrowers post USDC or cirBTC as collateral and draw USDC instantly up to 66% of collateral value. cirBTC is used here as a testnet representation of wrapped Bitcoin. Its exchange rate against USDC is set via a fixed demo parameter (1 cirBTC = 100,000 USDC) rather than a live price oracle.

**Swap**
Two independent constant-product AMM pools (USDC/EURC and USDC/cirBTC), each with a 0.3% liquidity provider fee, slippage protection, a live price-impact indicator, and LP share tracking.

**Bridge**
Real CCTP v2 burn-and-mint bridging into Arc from any supported testnet chain. A second mode is built on Circle's Unified Balance (Gateway), for spending USDC held across multiple chains directly to an Arc wallet.

### Treasury & Payments

**FlowPay**
Continuous payment streaming. Funds vest to the recipient second-by-second over a sender-defined duration. A 0.25% platform fee is taken at stream creation.

**TrustLock**
Arbiter-based escrow. Release requires depositor or arbiter action. Refund requires beneficiary or arbiter action. A 1% fee applies on release only, none on refund.

**VaultGuard**
Multi-signer shared treasury with configurable approval thresholds. Signer membership and confirmation threshold can be updated after deployment. A 0.2% fee applies on executed transfers.

**VeloPay**
Invoice factoring. A freelancer or SME uploads an unpaid invoice and receives 97% of its face value immediately from a shared liquidity pool. The debtor repays the full amount later, with a 0.5% platform fee on repayment.

Each treasury module surfaces its fee breakdown live in the interface before a transaction is submitted.

## Circle Stack Integration

**USDC** as the settlement asset across all eight modules, alongside EURC and cirBTC where relevant.

**CCTP**, via Circle App Kit, for genuine cross-chain USDC transfer into Arc.

**Circle Gateway**, via App Kit's Unified Balance, for combining USDC held across chains into a single spendable balance on Arc.

**Circle Wallets** (User-Controlled), giving users a working Arc wallet from an email address and PIN, with no browser extension or seed phrase.

## Setup

StableLab is a static site (plain HTML, CSS, and JavaScript, with ethers.js loaded from a CDN). There is no build step and no npm install required for the core DeFi modules.

**Running the core modules locally or on GitHub Pages**
Clone the repo and serve the files with any static file server. Connect an EVM wallet (Rabby or MetaMask) to Arc Network Testnet (chain ID 5042002) and the Staking, Lending, Swap, Bridge, FlowPay, TrustLock, VaultGuard, and VeloPay modules work directly against the deployed contracts.

**Running Circle Wallets locally**
The `/wallet/` module needs a server-held API credential, so it only works when deployed with serverless functions (this repo is deployed on Vercel for that reason). To run it yourself:
1. Deploy the repo to Vercel.
2. Set the environment variable `CIRCLE_API_KEY` to a Circle test API key, keeping the `TEST_API_KEY:` prefix included.
3. The `/wallet/` page will call the serverless function, which brokers Circle Wallets authentication server-side.

The GitHub Pages mirror does not include the serverless backend, so `/wallet/` will not work there. It works only on the Vercel deployment.

## Circle Integration Details

**CCTP (Bridge)**
Uses Circle's App Kit SDK, loaded via jsdelivr as an ES module. The bridge calls `kit.getSupportedChains("bridge")` to pull the live list of supported source chains and their USDC contract addresses at runtime, rather than hardcoding a chain list. Roughly 22 EVM testnets are covered.

**Circle Gateway (Unified Balance)**
Same App Kit SDK, using `kit.getSupportedChains("unifiedBalance")` to combine USDC held across multiple chains into a single spendable balance on Arc.

**Circle Wallets (User-Controlled)**
Uses `@circle-fin/w3s-pw-web-sdk`, loaded via jsdelivr as an ES module, with App ID `bbd478e6-cd6c-5d48-924b-b5f29af26638` and `blockchains: ["ARC-TESTNET"]`. Because wallet creation requires a server-held API credential, a thin Vercel serverless function holds the `CIRCLE_API_KEY` and brokers the authentication step. The client never sees the API key directly.

## Contracts (Arc Testnet)

**Chain ID:** 5042002

| Contract | Address |
|---|---|
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| cirBTC | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` |
| Staking | `0x35F2E254c71394f923B6Ac2Aead20beAf41573E5` |
| Lending | `0x7d1cb2D60523c557f1FcCd2ffa8FbADC00C1C1bC` |
| Swap | `0x2b91E208152c372e7F2F51e69CE9738DD0Cca784` |
| FlowPay (streaming) | `0x7e57100bb7e942Ee10F99aCbf0e6Fd282b220A3B` |
| TrustLock (escrow) | `0x8BBdE5DeA50C370b116efda19c2554BCF64Dac8c` |
| VaultGuard (multi-sig) | `0x410862a8d468028D777Df00368D652922054ae2E` |
| VeloPay (invoice factoring) | `0x7be5cE722405A1d965c8e8E81535B74Eb5D0Ef47` |

## Site Structure

```
/staking/   /lending/   /swap/      /streaming/
/escrow/    /multisig/  /velopay/   /bridge/
/wallet/    /core/      /treasury/  /about/
/pricing/   /contact/
```

Deployed on both GitHub Pages (static) and Vercel (adds serverless functions for Circle Wallets authentication).

## Status

All contracts are deployed and verified on Arc Testnet. Every module has been tested end-to-end, deposit through withdrawal, including the CCTP bridge flow and Circle Wallets onboarding. Open source, under active development.

## Feedback

Open to feedback from anyone in the community. This project continues to be improved and updated based on it.
