# 🔗 Neroworks Freelance Marketplace

A decentralized, trustless freelance marketplace built on **Nero Chain** using **Account Abstraction (AA)** and **Paymaster** for gasless onboarding. Employers can post jobs, and freelancers can get hired with ease, speed, and security.

---

## 🚀 Features

* ✅ **Account Abstraction (AA)** integration for seamless wallet experience.
* ✅ **Gasless onboarding** via **Nero Paymaster**.
* ✅ Register as either a **Freelancer** or **Employer**.
* ✅ Role-based dashboards for managing jobs and applications.
* ✅ NFT-based profile image uploads via **Pinata** + IPFS.
* ✅ Role detection and conditional UI rendering from smart contract state.
* ✅ Wallet connection with persistent role-based routing.
* ✅ Deployed on the **Nero Testnet**.

---

## 🌐 Live Demo

[live URL](https://neroworks.vercel.app)

---

## 🛠 Tech Stack

| Layer          | Tech                                 |
| -------------- | ------------------------------------ |
| Smart Contract | Solidity on Nero Testnet             |
| Frontend       | Next.js 14, Tailwind CSS, TypeScript |
| Wallet         | Ethers.js, Nero Chain AA Wallet      |
| Backend Infra  | Pinata (IPFS), Axios                 |
| UX             | Framer Motion, React Toastify        |

---

## 🧠 Smart Contracts

### 📄 Employer & Freelancer Registration

* Both roles register through AA Wallet via contract interactions.
* Their status is verified from the contract, **not** localStorage, to avoid spoofing.
* Upon registration:

  * The `user_role` from localStorage is cleared.
  * They are redirected to their respective dashboards.

### 🏦 Paymaster

The Paymaster contract handles gasless interactions for both employers and freelancers when registering.

---

## 📂 Project Structure

```
/components
  - Navbar.tsx
  - HomeHero.tsx
  - EmployerDashboard.tsx
  - FreelancerDashboard.tsx
  - JobCard.tsx
/pages
  - index.tsx
  - register.tsx
  - employer-dashboard.tsx
  - freelancer-dashboard.tsx
/utils
  - aaUtils.ts
  - contractHelpers.ts
```

---

## 🔧 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/blockend-dev/neroworks.git
cd neroworks
```

### 2. Install dependencies (contract and frontend)
 
```bash
npm install
```

### 3. Create `.env.local`

```env
NEXT_PUBLIC_PINATA_KEY=your_pinata_key
NEXT_PUBLIC_SECRET_KEY=your_pinata_secret
NEXT_PUBLIC_NFT_CONTRACT=your_contract_address
REACT_APP_PAYMASTER_URL=
```

### 4. Run the dev server

```bash
npm run dev
```

---

## 📝 Usage Guide

### Home Page

* Click **Join as Freelancer** or **Join as Employer**.
* This sets `user_role` in localStorage temporarily.
* Redirects to `/register`.

### Registration Page

* Upload image to Pinata.
* Register via `registerEmployer` or `registerFreelancer` function.
* Upon success:

  * LocalStorage cleared.
  * Redirected to `/freelancer-dashboard` or `/employer-dashboard`.

### Dashboard

* Dynamic routing based on wallet + contract verification.
* Only freelancers can access freelancer dashboard, and same for employer.

---


## 📘 Notes

* Wallet connection required for all interactions.
* Role enforcement happens **on-chain**, not in frontend state.
* Works even after page refresh due to contract-based validation.

---

## 📜 License



 
