// lib/supabase/database.types.ts
// Auto-generate the full version with:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          tier: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          tier?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          tier?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          rail: string;
          status: string;
          amount_cents: number | null;
          amount_usdc: number | null;
          tx_signature: string | null;
          stripe_event_id: string | null;
          stripe_session_id: string | null;
          failure_reason: string | null;
          line_items: Record<string, unknown>[] | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          rail: string;
          status?: string;
          amount_cents?: number | null;
          amount_usdc?: number | null;
          tx_signature?: string | null;
          stripe_event_id?: string | null;
          stripe_session_id?: string | null;
          failure_reason?: string | null;
          line_items?: Record<string, unknown>[] | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rail?: string;
          status?: string;
          amount_cents?: number | null;
          amount_usdc?: number | null;
          tx_signature?: string | null;
          stripe_event_id?: string | null;
          stripe_session_id?: string | null;
          failure_reason?: string | null;
          line_items?: Record<string, unknown>[] | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      solana_invoices: {
        Row: {
          invoice_id: string;
          user_id: string;
          product_id: string;
          qty: number;
          amount_usdc: number;
          reference_key: string;
          recipient_ata: string;
          status: string;
          tx_signature: string | null;
          failure_reason: string | null;
          actual_usdc: number | null;
          expires_at: string;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          invoice_id: string;
          user_id: string;
          product_id: string;
          qty: number;
          amount_usdc: number;
          reference_key: string;
          recipient_ata: string;
          status?: string;
          tx_signature?: string | null;
          failure_reason?: string | null;
          actual_usdc?: number | null;
          expires_at: string;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          invoice_id?: string;
          user_id?: string;
          product_id?: string;
          qty?: number;
          amount_usdc?: number;
          reference_key?: string;
          recipient_ata?: string;
          status?: string;
          tx_signature?: string | null;
          failure_reason?: string | null;
          actual_usdc?: number | null;
          expires_at?: string;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      processed_events: {
        Row: {
          id: string;
          rail: string;
          order_id: string;
          processed_at: string;
          handler_error: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          rail: string;
          order_id: string;
          processed_at: string;
          handler_error?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          rail?: string;
          order_id?: string;
          processed_at?: string;
          handler_error?: string | null;
          updated_at?: string | null;
        };
      };
      ambassador_commissions: {
        Row: {
          id: string;
          referred_user_id: string | null;
          order_id: string | null;
          commission_usdc: number;
          commission_usd: number;
          commission_tier: number;
          status: "pending" | "confirmed" | "paid" | "reversed";
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referred_user_id?: string | null;
          order_id?: string | null;
          commission_usdc: number;
          commission_usd: number;
          commission_tier: number;
          status?: "pending" | "confirmed" | "paid" | "reversed";
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          referred_user_id?: string | null;
          order_id?: string | null;
          commission_usdc?: number;
          commission_usd?: number;
          commission_tier?: number;
          status?: "pending" | "confirmed" | "paid" | "reversed";
          paid_at?: string | null;
          created_at?: string;
        };
      };
      continuity_ledger: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          encrypted_payload: string | null;
          iv: string | null;
          salt: string | null;
          blueprint_data: Record<string, unknown> | null;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          encrypted_payload?: string | null;
          iv?: string | null;
          salt?: string | null;
          blueprint_data?: Record<string, unknown> | null;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          encrypted_payload?: string | null;
          iv?: string | null;
          salt?: string | null;
          blueprint_data?: Record<string, unknown> | null;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
