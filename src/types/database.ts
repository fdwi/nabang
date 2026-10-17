export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = "income" | "expense" | "transfer";
export type CategoryType = "income" | "expense";
export type GoalStatus = "active" | "completed" | "paused" | "cancelled";
export type AccountType = "cash" | "bank" | "ewallet" | "other";
export type ContributionType = "deposit" | "withdrawal";
export type ReminderFrequency = "daily" | "weekly" | "monthly";

export interface WarungItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export type WarungOrder = Database["public"]["Tables"]["warung_orders"]["Row"];

export interface Database {
  public: {
    Tables: {
      warung_orders: {
        Row: {
          id: string;
          user_id: string;
          warung_name: string;
          items: WarungItem[];
          total_amount: number;
          is_paid: boolean;
          account_id: string | null;
          transaction_id: string | null;
          ordered_at: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          warung_name: string;
          items?: WarungItem[];
          total_amount?: number;
          is_paid?: boolean;
          account_id?: string | null;
          transaction_id?: string | null;
          ordered_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          warung_name?: string;
          items?: WarungItem[];
          total_amount?: number;
          is_paid?: boolean;
          account_id?: string | null;
          transaction_id?: string | null;
          ordered_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          theme: "light" | "dark" | "system";
          currency: "IDR";
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          theme?: "light" | "dark" | "system";
          currency?: "IDR";
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          theme?: "light" | "dark" | "system";
          currency?: "IDR";
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: AccountType;
          opening_balance: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          account_type: AccountType;
          opening_balance?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: AccountType;
          opening_balance?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: CategoryType;
          color: string | null;
          icon: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          type: CategoryType;
          color?: string | null;
          icon?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: CategoryType;
          color?: string | null;
          icon?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          account_id: string;
          destination_account_id: string | null;
          category_id: string | null;
          description: string | null;
          occurred_at: string;
          idempotency_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type: TransactionType;
          amount: number;
          account_id: string;
          destination_account_id?: string | null;
          category_id?: string | null;
          description?: string | null;
          occurred_at?: string;
          idempotency_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: TransactionType;
          amount?: number;
          account_id?: string;
          destination_account_id?: string | null;
          category_id?: string | null;
          description?: string | null;
          occurred_at?: string;
          idempotency_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          initial_amount: number;
          deadline: string | null;
          status: GoalStatus;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          target_amount: number;
          initial_amount?: number;
          deadline?: string | null;
          status?: GoalStatus;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          initial_amount?: number;
          deadline?: string | null;
          status?: GoalStatus;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goal_contributions: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          transaction_id: string | null;
          amount: number;
          contribution_type: ContributionType;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          goal_id: string;
          transaction_id?: string | null;
          amount: number;
          contribution_type: ContributionType;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          transaction_id?: string | null;
          amount?: number;
          contribution_type?: ContributionType;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          month: string;
          limit_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          category_id: string;
          month: string;
          limit_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          month?: string;
          limit_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number | null;
          frequency: ReminderFrequency;
          reminder_time: string;
          day_of_week: number | null;
          day_of_month: number | null;
          next_reminder_at: string | null;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          amount?: number | null;
          frequency: ReminderFrequency;
          reminder_time?: string;
          day_of_week?: number | null;
          day_of_month?: number | null;
          next_reminder_at?: string | null;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number | null;
          frequency?: ReminderFrequency;
          reminder_time?: string;
          day_of_week?: number | null;
          day_of_month?: number | null;
          next_reminder_at?: string | null;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      transaction_type: TransactionType;
      category_type: CategoryType;
      goal_status: GoalStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
