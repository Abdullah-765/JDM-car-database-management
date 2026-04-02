# 🚘 Japanese Car Dealership App - Internal Documentation

Welcome to the internal documentation for the **JDM Import Dealership Dashboard**. This document breaks down the underlying architecture, data flow, and component structure of our full-stack application.

## 🛠 Technology Stack
This project runs entirely on a modern React ecosystem:
- **Framework**: Next.js 15 (App Router architecture).
- **Styling**: Tailwind CSS via `globals.css` and custom `tailwind.config.ts`.
- **UI Components**: custom headless building blocks derived from *shadcn/ui* (Dialog, Table, Select, Input, Badge).
- **Database Backend**: Supabase (PostgreSQL database as a service).
- **Icons**: `lucide-react` dynamically imported to keep bundles small.
- **Merge Utilities**: `clsx` and `tailwind-merge` (bound to a global `cn()` helper string) mapping precise responsive utility states.

---

## 📂 Project Structure
*Notice: We cleanly bypassed the default `src/` directory to adhere to a flat, professional Next.js 15 standard architecture.*

```text
/car_database
│
├── /app                  // Core Next.js Routing
│   ├── page.tsx          // The primary unified Dashboard interface (Client Component)
│   ├── layout.tsx        // The Root layout wrapping fonts & standard HTML metadata
│   └── globals.css       // Native shadcn styling bindings and Tailwind directives
│
├── /components          
│   ├── dashboard-stats.tsx   // Displays Total Cars, Available, Sold, and Profit metrics
│   ├── cars-table.tsx        // The dynamic data grid rendering current inventory
│   ├── car-form-modal.tsx    // The interactive Dialog used to Create or Edit cars
│   └── /ui                   // Generic, reusable shadcn interfaces (Buttons, Inputs, etc.)
│
├── /lib                 
│   ├── supabase.ts       // Global Supabase client initialization handling .env keys
│   └── utils.ts          // The structural `cn(...)` utility keeping component styles clean
│
├── .env.local            // Environment credentials linking the Next build to Supabase natively
└── database_setup.sql    // The raw PostgreSQL initialization script that built our table
```

---

## 🚦 Application Data Flow (How It Works)

### 1. Database Connection (`lib/supabase.ts`)
The entire application communicates with Supabase through the singleton pattern established here.
It securely pulls your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` out of `.env.local` to safely construct an authorized `createClient()` instance.

### 2. The Main Engine (`app/page.tsx`)
The dashboard is a powerful **Client Component** (`"use client"`). 
1. **Fetching**: When the page loads, `useEffect` triggers `fetchCars()`. The Supabase client asynchronously requests every row inside the `cars` table and binds it to a standard React `useState` array.
2. **Filtering**: Two generic state trackers (`searchQuery` and `statusFilter`) act as a responsive UI firewall. Before the `cars` array is passed to the table, it natively filters against multiple metadata targets (Chassis Number, Status, Customer, Number Plate).
3. **Optimistic Updates**: When you Add, Edit, or Delete a car via the table, the root `page.tsx` executes the corresponding Supabase `delete()` or `update()` query, and inherently calls `fetchCars()` again to seamlessly hydrate the grid in real-time.

### 3. The Modal Forms (`components/car-form-modal.tsx`)
Because database numeric columns crash when they are fed empty objects or `null` unverified inputs, the `CarFormModal` utilizes advanced React state tracking:
- When a user adds a new car, all numerical forms natively initialize internally as empty strings (`''`) to ensure you don't fight a pre-populated zero (`0`) while typing.
- When you click "Save", the native `handleSubmit` function maps through the form state; if you left any financial box entirely blank, the client automatically forces it back to mathematically safe `0` right before beaming it to Supabase via `onSave(sanitized)`.

### 4. The UI Engine (`globals.css` & `tailwind.config.ts`)
To establish our gorgeous aesthetic layout (white modular cards floating elegantly over dark backgrounds):
- `globals.css` declares dynamic base themes like `--background: 0 0% 100%;` underneath `:root`.
- `tailwind.config.ts` wraps those color tokens inside mathematical `hsl(...)` functions. This bridges the physical connection between Tailwind's rendering engine and the native CSS colors required for transparent UI modals to correctly bind to solid white.

---

## 🚀 Maintaining the App
1. **Adding columns**: If you ever want to track a new metric (like `mileage`), simply add the column in your Supabase Dashboard via SQL. Then edit the TS `Car` interface in `lib/supabase.ts`, and finally pop an extra `<Input />` block into `car-form-modal.tsx`.
2. **Deploying**: Vercel offers the best automated deployment for Next.js models. Just hook up your GitHub repository to Vercel and paste your two `.env.local` credentials into their production settings. You are good to go!
