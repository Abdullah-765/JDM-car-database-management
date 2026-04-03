# JDM Import Dealership Dashboard

A professional, high-performance inventory management system designed specifically for a Japanese car dealership. This full-stack application allows authorized staff to manage car imports, track complex financial metrics (JPY to USD/SHS conversions), and monitor real-time profit analytics with a sleek, brutalist-inspired UI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## key Features

- **Secure Authentication**: Integrated Supabase OTP (One-Time Password) system for authorized-only access.
- **Real-time Analytics**: Dynamic dashboard showing total inventory, available stock, sales, and total profit calculated across multiple currencies.
- **Complete Inventory Lifecycle**: Add, view, edit, and delete vehicle records with a specialized modal-driven interface.
- **Complex Financial Logic**: Built-in calculators for tax, VAT, port clearance, and Profit/Loss across JPY, USD, and Kenyan Shillings.
- **Advanced Filtering**: Instant lookup by Chassis Number, Customer Name, or Number Plate with status-based categorization.
- **Adaptive UI**: Fully responsive, sharp-edged "Brutalist" design with seamless Light/Dark mode switching.

## Technical Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom design system (sharpened Shadcn components).
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL) for secure data persistence and Auth.
- **State Management**: React Hooks (`useState`, `useEffect`) and Supabase Real-time subscriptions logic.
- **Icons**: [Lucide React](https://lucide.dev/).

## Project Architecture

```text
/
├── app/                  # Next.js 15 App Router (Pages & Layout)
├── components/           
│   ├── ui/               # Reusable atomic UI components (Buttons, Inputs, etc.)
│   ├── cars-table.tsx    # Optimized inventory data grid
│   ├── car-form-modal.tsx# Complex data entry & calculation engine
│   └── login-page.tsx    # High-contrast brutalist auth portal
├── lib/                  # Utilities & API configurations
│   ├── supabase.ts       # Database client logic
│   └── utils.ts          # Style merging overrides
└── public/               # Static assets & icons
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A Supabase project (URL and Anon/Service Key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdullah-765/JDM-car-database-management.git
   cd JDM-car-database-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize Database**
   Run the provided `database_setup.sql` in your Supabase SQL Editor to create the required table and policies.

5. **Run locally**
   ```bash
   npm run dev
   ```