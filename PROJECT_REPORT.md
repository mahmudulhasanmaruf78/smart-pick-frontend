# ACADEMIC PROJECT REPORT

---

# **SmartPick: Direct Peer-to-Peer Delivery Management System**
### **Course**: Advanced Web Technologies (AWT) — 12th Semester  
**Academic Term**: Summer 2025–2026  

**Submitted By**:  
* **Student Name**: Hasnain  
* **Role**: Lead Customer Experience & Frontend Interface  

**Collaborator**:  
* **Partner Name**: Mahmudul Hasan Maruf  
* **Role**: Architecture, Rider Logistics & Administrator Console  

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Core Motivation](#2-problem-statement--core-motivation)
3. [The P2P Commuter Innovation Model](#3-the-p2p-commuter-innovation-model)
4. [Technology Stack & System Architecture](#4-technology-stack--system-architecture)
5. [Detailed Modules Implemented by Hasnain](#5-detailed-modules-implemented-by-hasnain)
   - 5.1 Landing Page & Navigation
   - 5.2 Customer Registration & Validation
   - 5.3 Customer Authentication & JWT Lifecycle
   - 5.4 Consignment Booking & Dynamic Fare Calculation
   - 5.5 Order Tracking & The 1-Hour Cancellation Enforcement
   - 5.6 Profile Management & Identity Locking
   - 5.7 Session Management & Logout Flow
6. [Backend Business Rules & Database Schemas](#6-backend-business-rules--database-schemas)
7. [Team Division & Collaborative Git Workflow](#7-team-division--collaborative-git-workflow)
8. [Testing, Build Validation & Results](#8-testing-build-validation--results)
9. [Conclusion & Future Enhancements](#9-conclusion--future-enhancements)

---

## 1. Executive Summary
Traditional parcel courier platforms in Bangladesh rely heavily on centralized corporate hubs, dedicated commercial delivery fleets, and multiple tiers of middlemen. This overhead inflates shipping costs and introduces multi-day warehouse bottlenecks. 

**SmartPick (ZoneExpress BD)** addresses this systemic inefficiency through a **crowdsourced, peer-to-peer (P2P) on-the-way delivery platform**. By linking parcel senders (Customers) directly with everyday citizens traveling matching routes (Commuter Riders—such as university students and office workers), SmartPick cuts out intermediate shipping overhead. Customers receive point-to-point delivery at reduced costs, while daily commuters monetize empty travel capacity on their regular commute.

This report documents the architectural design, implementation, and verification of the **Customer Platform**, developed by **Hasnain**, built with Next.js (App Router), TypeScript, and Tailwind CSS, interfacing with an asynchronous NestJS and PostgreSQL backend.

---

## 2. Problem Statement & Core Motivation
### 2.1 The Intermediary Problem
In conventional courier systems (e.g., RedX, Steadfast, Pathao Courier), a parcel undergoes a fragmented, multi-step transit chain:
```
Sender ➔ Local Hub ➔ Sorting Warehouse ➔ Regional Distribution Center ➔ Delivery Rider ➔ Recipient
```
Each intermediate stage incurs handling costs, sorting expenses, and corporate commission cuts that inflate the final fare for the customer.

### 2.2 Unutilized Urban Commuter Energy
Every day, tens of thousands of university students and office workers commute across predictable routes (e.g., Dhanmondi to Kuril / AIUB, Mirpur to Motijheel). Their personal vehicular space, public transit transit bags, and travel time represent untapped logistics capacity.

---

## 3. The P2P Commuter Innovation Model
SmartPick removes corporate sorting centers by treating everyday commuters as decentralized courier nodes:
* **Zero Corporate Warehousing**: Parcels are picked up directly from the sender and dropped off at the destination by a traveler already going that way.
* **Mutual Financial Benefit**:
  * **Customers** enjoy affordable delivery fees without agency markups.
  * **Commuter Riders** earn pocket income covering their daily transit or fuel costs without detouring from their travel route.

```
┌──────────────┐                               ┌──────────────┐
│   Customer   │ ─── Direct Point-to-Point ──► │  Recipient   │
│   (Sender)   │      via Commuter Rider       │ (Destination)│
└──────────────┘                               └──────────────┘
```

---

## 4. Technology Stack & System Architecture

### 4.1 System Overview
The platform uses a decoupled client-server architecture communicating via stateless RESTful JSON APIs and JWT Bearer authorization:

| Layer | Technology | Primary Role |
|:---|:---|:---|
| **Frontend Framework** | **Next.js 16.3.4 (App Router)** | Client-side routing, prerendered static pages, component architecture |
| **Language** | **TypeScript 5.x** | Static typing, interface contracts, compile-time type safety |
| **Styling** | **Tailwind CSS v4** | Utility-first CSS framework for responsive layouts |
| **Backend Framework** | **NestJS 11.x** | Modular server architecture, Dependency Injection, Validation Pipes |
| **Database & ORM** | **PostgreSQL + TypeORM** | Relational data persistence, schema migrations, foreign key constraints |
| **Security & Auth** | **JWT + Passport + Bcrypt** | Stateless cryptographic session tokens, password salt-hashing (10 rounds) |
| **Network Protocol** | **HTTP / REST / CORS** | Client-server communication enabled across port 3000 (FE) and 3001 (BE) |

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│               (Port 3000 - App Router)                 │
│  Landing Page | Register | Login | Create Order | Orders│
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON / JWT Bearer
                            ▼
┌────────────────────────────────────────────────────────┐
│                    NestJS Backend                      │
│                  (Port 3001 - REST API)                │
│  JwtAuthGuard | RolesGuard | ValidationPipe | Services │
└───────────────────────────┬────────────────────────────┘
                            │ TypeORM
                            ▼
┌────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                    │
│     users | rider_verifications | orders | zones       │
└───────────────────────────┘
```

---

## 5. Detailed Modules Implemented by Hasnain

As Lead Customer Experience Engineer, **Hasnain** designed, coded, and integrated the entire customer-facing product flow:

### 5.1 Landing Page (`src/app/page.tsx`)
* **Purpose**: Serves as the primary public entry point for visitors, explaining the P2P delivery model and providing clear role-based onboarding paths.
* **Architecture**:
  * Utilizes Next.js `<Link>` components for instantaneous client-side navigation without full-page reloads.
  * Stretches edge-to-edge across the screen using Tailwind utility classes (`w-full`, `min-h-screen`, `bg-white`).
  * Features dual call-to-action buttons:
    * 🔵 **Sign Up as Customer** ➔ routes to `/register`
    * 🟢 **Sign Up as Rider** ➔ routes to `/rider/register`
  * Displays a focused, clean hero section with direct links for returning users to log in or book directly.

### 5.2 Customer Registration (`src/app/register/page.tsx`)
* **Purpose**: Allows new users to create verified Customer accounts.
* **Mechanism**:
  * Captures four fields: Full Name, Email, 11-digit Phone Number, and Password.
  * Dispatches an HTTP `POST` to `http://localhost:3001/auth/register-customer`.
  * The backend `RegisterCustomerDto` validates phone format (`/^01\d{9}$/`) and password complexity via `class-validator`.
  * NestJS hashes the password using `bcrypt` (10 rounds) before inserting the record into the PostgreSQL `users` table with `role = 'customer'`.
  * Upon receiving HTTP `201 Created`, the user receives an alert and is redirected to `/login`.

### 5.3 Customer Authentication & Session Management (`src/app/login/page.tsx`)
* **Purpose**: Authenticates customers and initiates secure sessions.
* **Mechanism**:
  * Form inputs collect `identity` (supporting either email or phone) and `password`.
  * Submits payload `{ identity, password }` to `POST http://localhost:3001/auth/login`.
  * NestJS verifies credentials via `bcrypt.compare()` and generates a cryptographically signed JWT containing `{ sub, email, role }`.
  * The frontend extracts `data.accessToken` and commits it to browser storage:
    ```typescript
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("role", data.user.role);
    ```
  * Automatically inspects the role and routes customers to `/orders`.

### 5.4 Consignment Booking & Dynamic Fare Calculation (`src/app/create-order/page.tsx`)
* **Purpose**: Enables authenticated customers to place parcel delivery requests.
* **Mechanism**:
  * **Route Guard**: A `useEffect` hook verifies `localStorage.getItem("token")`. If missing, users are redirected to `/login`.
  * **Data Collection**:
    * `pickupZone` & `dropZone`: Dropdowns for `"Inside Dhaka"` and `"Outside Dhaka"`.
    * `pickupArea` & `dropArea`: Specific address strings.
    * `parcelType`: Enum (`document`, `parcel`, `fragile`).
    * `weight`: Parcel weight in kilograms (minimum 0.1 kg).
    * `deliveryType`: Speed selection (`regular` or `express`).
  * **Backend Processing**:
    * Sends `POST http://localhost:3001/orders/create` with header `Authorization: Bearer <token>`.
    * Protected on backend by `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(Role.Customer)`.
    * NestJS invokes `calculateFare()`:
      $$\text{Fare} = \text{Base Fare} + \max(0, \text{Weight} - \text{Weight Limit}) \times \text{Extra Weight Rate}$$
    * The order is saved to the `orders` table with `status = 'pending'` and `customerId = req.user.id`.
    * An alert displays the computed delivery charge (e.g. `60 BDT`), and the customer is routed to `/orders`.

### 5.5 Order Tracking & 1-Hour Cancellation Enforcement (`src/app/orders/page.tsx`)
* **Purpose**: Central tracking dashboard displaying live parcel states and cancellation controls.
* **Mechanism**:
  * On mount, executes `GET http://localhost:3001/orders/customer/history` with `Bearer <token>`.
  * Queries PostgreSQL using `orderRepository.find({ where: { customerId }, order: { createdAt: 'DESC' } })`.
  * Renders order cards with dynamic status badges:
    * 🟡 **Pending**: Waiting for commuter claim.
    * 🔵 **Accepted / Picked Up / In Transit**: Commuter in route.
    * 🟢 **Delivered**: Completed transaction.
    * 🔴 **Cancelled**: Voided order.
  * **1-Hour Cancellation Business Rule**:
    * If order is `pending`: Customer can click "Cancel Order" (`DELETE /orders/customer/cancel/:id`), and it is cancelled immediately.
    * If order is `accepted`: The backend checks:
      $$\Delta t = \text{Current Time} - \text{acceptedAt}$$
      If $\Delta t \le 1\text{ hour}$, cancellation is permitted; if $\Delta t > 1\text{ hour}$ or parcel is already in transit/delivered, the backend rejects cancellation to protect the commuter from wasted travel.

### 5.6 Profile Management & Identity Locking (`src/app/profile/page.tsx`)
* **Purpose**: Allows customers to review and maintain their personal account details.
* **Mechanism**:
  * On mount, sends `GET http://localhost:3001/users/profile` with `Bearer <token>`.
  * Populates customer Name, Email, Phone, and Role.
  * **Email Immutability (Identity Locking)**: The email field is rendered with `disabled` and `cursor-not-allowed`. Email serves as the unique primary key identifier in PostgreSQL; locking it prevents account hijacking and identity collision vulnerabilities.
  * **Updates**: Customers can edit their Name, Phone, and enter an optional new Password (which is re-hashed by `bcrypt`), submitted via `PATCH http://localhost:3001/users/profile`.

### 5.7 Session Management & Logout Flow
* **Purpose**: Terminates authenticated sessions securely across all pages.
* **Mechanism**:
  * Integrated directly into the unified navigation bar of `/orders`, `/create-order`, and `/profile`.
  * Executes a clean logout handler:
    ```typescript
    const handleLogout = () => {
      if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
      }
    };
    ```
  * Evicts cryptographic credentials from browser storage and redirects to `/login`.

---

## 6. Backend Business Rules & Database Schemas

### 6.1 Database Entity Relations
```
┌──────────────┐         1:1          ┌────────────────────┐
│    User      │ ───────────────────► │ RiderVerification  │
└──────┬───────┘                      └────────────────────┘
       │
       │ 1:N (Customer / Rider)
       ▼
┌──────────────┐         N:1          ┌────────────────────┐
│    Order     │ ───────────────────► │    DeliveryZone    │
└──────────────┘                      └────────────────────┘
```

### 6.2 Key Database Tables
1. **`users`**: Stores `id`, `name`, `email` (unique), `phone` (unique), `password` (bcrypt hash), `role` (`customer`, `rider`, `admin`), `isActive` (boolean), `createdAt`.
2. **`orders`**: Stores `id`, `pickupZone`, `pickupArea`, `dropZone`, `dropArea`, `parcelType`, `weight`, `deliveryType`, `fare`, `status` (`pending`, `accepted`, `picked_up`, `in_transit`, `delivered`, `cancelled`), `customerId` (FK), `riderId` (FK, nullable), `acceptedAt` (timestamp), `createdAt`.
3. **`delivery_zones`**: Stores `id`, `name` (`Inside Dhaka`, `Outside Dhaka`), `baseRegularFare`, `baseExpressFare`, `weightLimitKg`, `extraWeightRate`.

---

## 7. Team Division & Collaborative Git Workflow

To guarantee parallel productivity and avoid merge conflicts, the project was partitioned into distinct domains:

| Engineer | Assigned Domain | Source Files Owned |
|:---|:---|:---|
| **Hasnain** | **Customer Experience & Public UI** | `app/page.tsx`, `app/login/page.tsx`, `app/register/page.tsx`, `app/create-order/page.tsx`, `app/orders/page.tsx`, `app/profile/page.tsx` |
| **Maruf** | **Rider Logistics, Admin & Core Lib** | `app/rider/*`, `app/admin/*`, `lib/api.ts`, `middleware.ts`, `types/*` |

### 7.1 Git Branching & Synchronization Strategy
* Work was developed on independent Git feature branches: `Hasnain` and `Maruf`.
* Because file boundaries were strictly partitioned, when branch `origin/Maruf` was merged into `Hasnain`, all features integrated cleanly.
* All Customer commits were pushed to `origin/Hasnain` and verified against the upstream GitHub repository.

---

## 8. Testing, Build Validation & Results

### 8.1 Production Build Results
The entire Next.js application was verified via `npm run build` using Turbopack:
```text
▲ Next.js 16.3.4 (Turbopack)
✓ Compiled successfully in 2.3s
  Running TypeScript ...
  Finished TypeScript in 3.6s ...
✓ Generating static pages using 11 workers (16/16) in 1705ms

Route (app)
┌ ○ /                              [Landing Page - Hasnain]
├ ○ /login                         [Customer Login - Hasnain]
├ ○ /register                      [Customer Registration - Hasnain]
├ ○ /create-order                  [Parcel Booking - Hasnain]
├ ○ /orders                        [Order History - Hasnain]
├ ○ /profile                       [Profile Edit - Hasnain]
├ ○ /rider/register                [Rider Registration - Maruf]
├ ○ /rider/orders                  [Rider Order Board - Maruf]
├ ○ /rider/deliver                 [Delivery Stepper - Maruf]
├ ○ /admin                         [Admin Dashboard - Maruf]
├ ○ /admin/riders                  [Rider Verification - Maruf]
├ ○ /admin/users                   [User Management - Maruf]
└ ○ /admin/zones                   [Zone Management - Maruf]

Result: 16 of 16 routes compiled with 0 errors.
```

### 8.2 Functional Verification Matrix
| Test Case | Steps | Expected Result | Actual Result |
|:---|:---|:---|:---|
| **TC-01: Registration** | Fill valid 11-digit phone, complex password, submit | User inserted into DB, 201 Created | **PASS** |
| **TC-02: Login** | Enter `demo@gmail.com` and `Hasnayen@1` | JWT `accessToken` saved to `localStorage` | **PASS** |
| **TC-03: Booking** | Select zones, weight 1 kg, submit | Fare computed (60 BDT), status `pending` | **PASS** |
| **TC-04: Tracking** | Navigate to `/orders` | Consignment card visible with yellow badge | **PASS** |
| **TC-05: Cancellation**| Click "Cancel Order" on pending order | Status transitions to `cancelled` | **PASS** |
| **TC-06: Profile** | Update Name & Phone, verify Email is locked | Email field disabled; Name/Phone updated | **PASS** |
| **TC-07: Logout** | Click "Logout" button | Tokens evicted, redirected to `/login` | **PASS** |

---

## 9. Conclusion & Future Enhancements

### 9.1 Conclusion
The **SmartPick** customer platform successfully fulfills all software requirements for the Advanced Web Technologies course. By leveraging Next.js App Router, stateless JWT authentication, and TypeORM relational persistence, the system delivers an intuitive, secure, and responsive user experience that demonstrates the viability of peer-to-peer urban logistics.

### 9.2 Future Enhancements
1. **Interactive Route Mapping**: Integrating Leaflet/Mapbox API for visual GPS pin-point selection and real-time commuter vehicle tracking.
2. **Digital Escrow Payments**: Integrating bKash/Nagad PGW with an escrow model where delivery funds are released to the rider only after customer OTP confirmation.
3. **WebSockets (Socket.IO)**: Replacing polling with real-time push notifications when a rider claims or updates consignment delivery status.
