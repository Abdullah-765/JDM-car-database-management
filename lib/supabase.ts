import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CarStatus = 'Available' | 'Sold' | 'Reserved' | 'In Transit';

export interface Car {
  id: number;
  status: CarStatus;
  customer_name: string | null;
  chassis_no: string;
  price_jpy: number;
  price_usd: number;
  port_clearance: number;
  total_cost_dollars: number;
  total_cost_shs: number;
  tax: number;
  number_plate: string | null;
  vat: number;
  clearance: number;
  total_own_cost: number;
  sold_price: number | null;
  profit_shs: number | null;
  profit_dollars: number | null;
  profit_jpy: number | null;
  created_at?: string;
}
