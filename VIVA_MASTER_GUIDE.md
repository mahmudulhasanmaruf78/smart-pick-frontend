# 🎓 SmartPick — Hasnain's Complete Viva Defense & Technical Master Guide

> **Course**: Advanced Web Technologies (AWT) — 12th Semester  
> **Project**: SmartPick (ZoneExpress BD) — Crowdsourced Peer-to-Peer Delivery Platform  
> **Student Role**: Hasnain (Lead Customer Experience & Frontend Interface)  
> **Partner Role**: Mahmudul Hasan Maruf (Architecture, Rider Logistics & Admin Console)  
> **Architecture Style**: **Style A (Component-Driven Architecture with Context API & Custom Hooks)**

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Clean Architecture Tree](#1-executive-summary--clean-architecture-tree)
2. [Why Style A? (Architecture Explained in Plain English)](#2-why-style-a-architecture-explained-in-plain-english)
3. [Component-by-Component Walkthrough](#3-component-by-component-walkthrough)
   - [`src/context/AuthContext.tsx`](#1-srccontextauthcontexttsx)
   - [`src/hooks/useAuth.ts`](#2-srchooksuseauthts)
   - [`src/components/ui/` (`Button`, `Input`, `Card`, `Badge`)](#3-srccomponentsui-primitives)
   - [`src/components/layout/Navbar.tsx`](#4-srccomponentslayoutnavbarttsx)
   - [`src/components/orders/` (`OrderForm`, `OrderCard`)](#5-srccomponentsorders-domain-components)
4. [Page-by-Page Mechanism (Frontend to Backend)](#4-page-by-page-mechanism-frontend-to-backend)
   - [Page 1: Landing Page (`/`)](#page-1-landing-page)
   - [Page 2: Registration (`/register`)](#page-2-customer-registration)
   - [Page 3: Login (`/login`)](#page-3-customer--system-login)
   - [Page 4: Consignment Booking (`/create-order`)](#page-4-consignment-booking)
   - [Page 5: My Orders & Cancellation (`/orders`)](#page-5-order-tracking--cancellation)
   - [Page 6: Profile Management (`/profile`)](#page-6-profile-management)
5. [Key Backend Business Rules (How It Works Behind the Scenes)](#5-key-backend-business-rules)
6. [Design System: Tailwind CSS Quick Reference](#6-design-system-tailwind-css-quick-reference)
7. [React & Next.js Core Concepts You Used](#7-react--nextjs-core-concepts)
8. [Top 12 Viva Defense Questions & Winning Answers](#8-top-12-viva-defense-questions--winning-answers)

---

## 1. Executive Summary & Clean Architecture Tree

To satisfy university project criteria while keeping the code **100% beginner-friendly and easy to explain in viva**, the customer frontend is organized into **Style A (Component-Driven Architecture)**:

```
src/
├── context/
│   └── AuthContext.tsx           # Global State: Stores logged-in user, JWT token, and session methods
├── hooks/
│   └── useAuth.ts                # Custom Hook: 8-line clean shortcut to consume AuthContext
├── components/
│   ├── ui/
│   │   ├── Button.tsx            # Multi-variant button (primary, danger, outline) + loading spinner
│   │   ├── Input.tsx             # Standardized text/password input with label and helper text
│   │   ├── Card.tsx              # Clean white container with border and drop-shadow
│   │   └── Badge.tsx             # Color-coded order status badge (Pending, Delivered, etc.)
│   ├── layout/
│   │   └── Navbar.tsx            # Global sticky navbar that reacts to user login status
│   └── orders/
│       ├── OrderForm.tsx         # Booking form with dropdowns, live weight, and POST /orders/create
│       └── OrderCard.tsx         # Single order card with status, fare, and 1-hour cancel button
└── app/
    ├── layout.tsx                # App root wrapped inside <AuthProvider>
    ├── page.tsx                  # Minimalist white hero landing page
    ├── login/page.tsx            # Login page powered by <Card />, <Input />, <Button />, useAuth()
    ├── register/page.tsx         # Registration powered by <Card />, <Input />, <Button />
    ├── create-order/page.tsx     # Booking page powered by <Navbar />, <Card />, <OrderForm />
    ├── orders/page.tsx           # Order console powered by <Navbar />, <OrderCard />
    └── profile/page.tsx          # Profile management powered by <Navbar />, <Card />, <Input />, <Button />
```

> **Note on Cleanup**: Unnecessary boilerplate and empty placeholder files (`useFetch.ts`, `Modal.tsx`, `Table.tsx`, `Sidebar.tsx`, `OrderStatusStepper.tsx`, and `ZoneSelect.tsx`) were deleted. Every single file remaining in your project contains **real, functional, readable code**.

---

## 2. Why Style A? (Architecture Explained in Plain English)

If the teacher asks: *"Why did you structure your frontend into components, context, and hooks?"*

### You Answer:
1. **Separation of Concerns**: Pages only manage route layout; components handle visual presentation; context handles global data.
2. **Avoids Code Duplication**: Instead of styling buttons and inputs 20 different times, we write them once in `components/ui/`.
3. **No Prop Drilling**: Instead of passing the `user` and `token` down through 5 layers of components, `AuthContext` makes it globally accessible anywhere in 1 line via `useAuth()`.
4. **Maintenance & Scalability**: If the UI theme changes from blue to emerald green, we only edit `Button.tsx` instead of editing 10 different pages.

---

## 3. Component-by-Component Walkthrough

### 1. `src/context/AuthContext.tsx`
* **What it is**: A React Context Provider for global authentication state.
* **State variables**:
  * `user`: An object containing `{ id, name, email, phone, role }`.
  * `token`: The JWT string received from NestJS upon login.
  * `role`: User role (`customer`, `rider`, or `admin`).
  * `loading`: Boolean indicating whether localStorage has finished loading on client boot.
* **Key Functions**:
  * `login(newToken, userData)`: Stores token & user in React state **and** persists them in browser `localStorage`.
  * `logout()`: Clears React state and deletes `token`, `role`, and `user` from `localStorage`, then redirects to `/login`.
  * `setUser(updatedUser)`: Updates user state when profile is edited.
* **Why it's wrapped in `app/layout.tsx`**: So that every page in the application tree has immediate access to the authenticated user.

### 2. `src/hooks/useAuth.ts`
* **What it is**: A custom React Hook that wraps `useContext(AuthContext)`.
* **The Code**:
  ```typescript
  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
  }
  ```
* **Why we use it**: It prevents us from importing both `useContext` and `AuthContext` in every file. In any page, you simply write:
  ```typescript
  const { user, token, logout } = useAuth();
  ```

### 3. `src/components/ui/` Primitives
* **`Button.tsx`**: Accepts `variant="primary" | "danger" | "outline"`, `loading={true|false}`, and standard HTML button attributes. Displays a spinning SVG animation when `loading` is true.
* **`Input.tsx`**: Standardized input wrapped in a container that displays a `label` above, the styled `<input />`, and optional `error` or `helperText` below.
* **`Card.tsx`**: A reusable white card container (`bg-white border border-gray-200 rounded-lg shadow-sm p-6`).
* **`Badge.tsx`**: Takes `status` (e.g., `"pending"`, `"accepted"`, `"delivered"`, `"cancelled"`) and renders a small colored pill tag.

### 4. `src/components/layout/Navbar.tsx`
* **What it is**: The global top navigation bar.
* **Reactive Behavior**:
  * If `token` exists: Shows **+ Book Parcel**, **My Orders**, **Profile**, and a red **Logout** button.
  * If `token` is null: Shows **Login**, **Customer Sign Up**, and **Rider Sign Up**.

### 5. `src/components/orders/` Domain Components
* **`OrderForm.tsx`**:
  * Contains the input fields and dropdowns for booking a parcel: Pickup Zone, Pickup Address, Drop Zone, Destination Address, Parcel Type, Weight (kg), and Delivery Speed (Regular vs Express).
  * On submit: Sends a `POST` request to `http://localhost:3001/orders/create` with `Authorization: Bearer <token>`.
  * Shows total calculated fare in an alert and redirects to `/orders`.
* **`OrderCard.tsx`**:
  * Formats and displays a single order: Order ID, Status Badge, Route (From -> To), Parcel Specs (Weight, Type, Speed), Assigned Rider info (if accepted), and Total Fare in BDT.
  * Contains a **Cancel Order** button that only renders if the order is `pending` or `accepted`.

---

## 4. Page-by-Page Mechanism (Frontend to Backend)

### Page 1: Landing Page (`src/app/page.tsx`)
* **Frontend Action**: Welcoming hero page introducing the peer-to-peer parcel crowdsourcing model.
* **Components Used**: `<Navbar />`, `<Button />`.
* **Backend Call**: None (100% static client-side performance).

---

### Page 2: Customer Registration (`src/app/register/page.tsx`)
* **Frontend Action**: Collects `name`, `email`, `phone` (11 digits), and `password`.
* **Components Used**: `<Card />`, `<Input />`, `<Button />`.
* **API Endpoint**: `POST http://localhost:3001/auth/register-customer`
* **Backend Mechanism**:
  1. `RegisterCustomerDto` validates phone format (`01XXXXXXXXX`), email syntax, and password strength via `class-validator`.
  2. `usersService.findByIdentity` queries PostgreSQL to prevent duplicate accounts.
  3. `bcrypt.hash(password, 10)` hashes the password.
  4. Saves record in `users` table with `role = 'customer'` and `isActive = true`.

---

### Page 3: Customer & System Login (`src/app/login/page.tsx`)
* **Frontend Action**: Collects `identity` (email or phone) and `password`.
* **Components Used**: `<Card />`, `<Input />`, `<Button />`, `useAuth()`.
* **API Endpoint**: `POST http://localhost:3001/auth/login`
* **Backend Mechanism**:
  1. Queries user by email or phone.
  2. Verifies account is active (`isActive === true`).
  3. Validates password via `bcrypt.compare`.
  4. Signs and returns a JSON Web Token (`accessToken`) with payload `{ sub: user.id, email, role }`.
* **Frontend State Update**: Calls `login(data.accessToken, data.user)` from `useAuth()`, which saves the session in React context and `localStorage`.
* **Auto-Routing**:
  * Rider ➔ `/rider/orders`
  * Admin ➔ `/admin`
  * Customer ➔ `/orders`

---

### Page 4: Consignment Booking (`src/app/create-order/page.tsx`)
* **Frontend Action**: Renders the booking interface.
* **Components Used**: `<Navbar />`, `<Card />`, `<OrderForm />`.
* **API Endpoint**: `POST http://localhost:3001/orders/create`
* **Backend Mechanism**:
  1. `JwtAuthGuard` & `RolesGuard` verify customer identity.
  2. **Dynamic Pricing Algorithm**: Looks up the destination zone in the `delivery_zones` table, extracts base regular/express fare, and adds surcharges for weight over 2 kg.
  3. Saves order to `orders` table with status `pending`.

---

### Page 5: Order Tracking & Cancellation (`src/app/orders/page.tsx`)
* **Frontend Action**: Displays customer order history and enables order cancellation.
* **Components Used**: `<Navbar />`, `<OrderCard />`, `<Button />`, `useAuth()`.
* **API Endpoints**:
  * **Fetch Orders**: `GET http://localhost:3001/orders/customer/history`
  * **Cancel Order**: `DELETE http://localhost:3001/orders/customer/cancel/:id`
* **Backend Mechanism (1-Hour Business Rule)**:
  * If `pending`: Cancels immediately.
  * If `accepted`: Calculates `(currentTime - acceptedAt)`. If $\le 1\text{ hour}$, approves cancellation; if $> 1\text{ hour}$, rejects with `BadRequestException`.
  * If `picked_up` or `delivered`: Cancellation is strictly blocked.

---

### Page 6: Profile Management (`src/app/profile/page.tsx`)
* **Frontend Action**: Customer views their account information and updates contact details.
* **Components Used**: `<Navbar />`, `<Card />`, `<Input />`, `<Button />`, `useAuth()`.
* **API Endpoints**:
  * **Load Profile**: `GET http://localhost:3001/users/profile`
  * **Update Profile**: `PATCH http://localhost:3001/users/profile`
* **Payload**: `{ name, phone, password? }` (email is excluded!).
* **Strict Business Rule**: Email is **locked / disabled**. In our architecture, the email is the user's permanent, verified system identity and cannot be edited.

---

## 5. Key Backend Business Rules

| Business Rule | Where It Is Enforced | How It Works |
| :--- | :--- | :--- |
| **Identity Login** | `auth.service.ts` | Allows logging in with either email or 11-digit phone number in the same input field. |
| **Password Hashing** | `auth.service.ts` | Uses `bcrypt` with 10 salt rounds. Plaintext passwords are never stored in the database. |
| **Dynamic Zone Pricing** | `orders.service.ts` | Queries `delivery_zones` table by zone name; calculates fare based on delivery type + excess weight. |
| **1-Hour Cancellation Window** | `orders.service.ts` | Customer can cancel within 60 minutes of a rider accepting. Afterwards, cancellation is locked to protect riders. |
| **Immutable Email Identifier** | `users.service.ts` | Profile updates only mutate `name`, `phone`, or `password`. Email is ignored in the update query. |

---

## 6. Design System: Tailwind CSS Quick Reference

### What is Tailwind CSS?
A utility-first CSS framework where styles are applied directly in JSX using class names instead of writing separate `.css` files.

| Class Name | CSS Equivalent | What It Does |
| :--- | :--- | :--- |
| `w-full` | `width: 100%;` | Full container width |
| `min-h-screen` | `min-height: 100vh;` | Full screen height |
| `max-w-4xl mx-auto` | `max-width: 896px; margin: 0 auto;` | Centers page content on desktop |
| `flex items-center justify-between` | `display: flex; align-items: center; justify-content: space-between;` | Horizontal navigation bar layout |
| `grid grid-cols-1 sm:grid-cols-2` | `display: grid;` | 1 column on mobile, 2 columns on desktop |
| `bg-white text-black` | `background: #fff; color: #000;` | Pure white background and dark text |
| `rounded-lg border border-gray-200` | `border-radius: 0.5rem; border: 1px solid #e5e7eb;` | Card styling with rounded borders |
| `hover:bg-blue-700 transition` | `:hover { background: #1d4ed8; }` | Smooth hover transition effect |

---

## 7. React & Next.js Core Concepts

1. **`"use client"`**: Next.js App Router defaults to Server Components. Writing `"use client"` at line 1 marks the file as a Client Component, allowing the use of React hooks (`useState`, `useEffect`, `useContext`) and browser APIs (`localStorage`).
2. **`useState`**: Preserves user input values between re-renders (e.g., `const [name, setName] = useState("")`).
3. **`useEffect`**: Runs side effects on component mount (e.g., fetching order history from backend when the page loads).
4. **`useContext`**: Subscribes to global React context (`AuthContext`) without prop drilling.
5. **`<Link href="...">`**: Client-side navigation that prefetches routes and transitions pages without reloading the browser.
6. **`useRouter`**: Programmatic navigation hook (`router.push('/orders')`).

---

## 8. Top 12 Viva Defense Questions & Winning Answers

### Q1: "What architecture style did you use for the frontend?"
> **Answer**: *"We used **Style A (Component-Driven Architecture)** with React Context API and Custom Hooks. We separated reusable design primitives into `components/ui/` (`Button`, `Input`, `Card`, `Badge`), navigation into `components/layout/` (`Navbar`), and parcel domain logic into `components/orders/` (`OrderForm`, `OrderCard`). Global authentication state is managed in `AuthContext` and accessed via our custom `useAuth()` hook."*

### Q2: "What is the difference between Prop Drilling and React Context API?"
> **Answer**: *"Prop drilling is passing data down multiple component layers through props, which becomes messy and error-prone. The Context API (`AuthContext`) creates a centralized data store wrapped at the root (`layout.tsx`). Any component in the app tree can access user state and token directly in one line using `useAuth()`."*

### Q3: "What is `useAuth.ts` and why did you create it?"
> **Answer**: *"It is a custom React hook that wraps `useContext(AuthContext)`. Instead of importing both `useContext` and `AuthContext` across every page, we simply call `useAuth()`. It also includes a safety check to ensure it is only used within an `AuthProvider`."*

### Q4: "How does authentication work from login to protected routes?"
> **Answer**: *"The user submits credentials at `/login`. Our NestJS backend validates the password using `bcrypt` and returns a signed JWT `accessToken`. We store this token in `localStorage` and `AuthContext`. When placing an order or checking history, our frontend attaches the token in the HTTP `Authorization: Bearer <token>` header. The backend `JwtAuthGuard` decodes and verifies the token on every request."*

### Q5: "Why can the user edit their name and phone, but NOT their email in the Profile page?"
> **Answer**: *"In our system architecture, the email is the user's permanent, verified account identifier. Allowing email changes could lead to identity fraud and invalidates historical order relationships. Therefore, the email input is disabled (`read-only`), and our `PATCH /users/profile` endpoint only accepts and updates `name`, `phone`, or `password`."*

### Q6: "What is the 1-hour cancellation business rule in your orders module?"
> **Answer**: *"If an order is still `pending`, the customer can cancel immediately. If a commuter rider has already `accepted` the order, the backend checks the timestamp difference `(currentTime - acceptedAt)`. If within 1 hour, cancellation is allowed and the rider is notified. If more than 1 hour has elapsed, or if the order is already in transit/delivered, cancellation is blocked with a `401/400` error to protect riders from wasted travel."*

### Q7: "How does dynamic delivery fare calculation work?"
> **Answer**: *"When a customer books a consignment in `OrderForm.tsx`, the backend queries our `delivery_zones` database table for the destination zone (e.g. Inside Dhaka). It retrieves the base fare (60 BDT for regular, 100 BDT for express) and the weight limit (2 kg). If the parcel exceeds 2 kg, it calculates `(weight - 2) * extraWeightRate` and adds it to the base fare."*

### Q8: "Why did you use Next.js App Router instead of plain React with Vite?"
> **Answer**: *"Next.js App Router provides file-system-based routing, automatic code splitting, optimized image and font loading, client-side prefetching with `<Link>`, and built-in production optimization with Turbopack, resulting in a fast production build."*

### Q9: "Why did you choose Tailwind CSS instead of Bootstrap or vanilla CSS?"
> **Answer**: *"Tailwind CSS is utility-first, meaning we style components directly in JSX without context-switching to separate stylesheets. Unlike Bootstrap, it has zero JavaScript overhead and avoids CSS specificity conflicts."*

### Q10: "What happens if a user refreshes the page? Does their login disappear?"
> **Answer**: *"No. Inside `AuthContext.tsx`, we have a `useEffect` hook that runs when the client mounts. It reads `localStorage.getItem('token')` and `localStorage.getItem('user')`. If found, it immediately restores the session in React state. The user remains logged in even after page refresh or closing the browser tab."*

### Q11: "What did you delete or simplify during project refactoring?"
> **Answer**: *"We removed empty placeholder files that were not part of our working customer pipeline—such as unused dummy modals, sidebars, and empty hooks like `useFetch.ts`. This kept our codebase 100% purposeful, easy to read, and zero-bloat."*

### Q12: "How was the work divided between you and your partner Maruf?"
> **Answer**: *"I (Hasnain) designed and built the entire Customer Experience and core design system: the Component-Driven UI primitives (`Button`, `Input`, `Card`, `Badge`), global `AuthContext` and `useAuth` hook, the Landing Page, Customer Registration and Login with auto-routing, Consignment Booking with dynamic payload submission, Customer Order Tracking with 1-hour cancellation, and Profile Management. Maruf built the Rider operations console (order acceptance feed and status update pipeline) and the Administrator management dashboard (zone configuration, user suspension, and rider NID verification)."*

---
*Good luck with your viva defense! You have a clean, modular, production-ready codebase.*
