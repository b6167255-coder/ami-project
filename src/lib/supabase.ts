import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          supabase_id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: 'kindergarten_teacher' | 'substitute_teacher';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      kindergartens: {
        Row: {
          id: string;
          name: string;
          location: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          principal_name: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      substitute_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          experience_years: number;
          certifications: string | null;
          hourly_rate: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['substitute_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      availability: {
        Row: {
          id: string;
          substitute_id: string;
          available_date: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['availability']['Row'], 'id' | 'created_at'>;
      };
      kindergarten_preferences: {
        Row: {
          id: string;
          substitute_id: string;
          kindergarten_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kindergarten_preferences']['Row'], 'id' | 'created_at'>;
      };
      substitute_requests: {
        Row: {
          id: string;
          requesting_teacher_id: string;
          kindergarten_id: string;
          request_date: string;
          status: 'pending' | 'fulfilled' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['substitute_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      request_matches: {
        Row: {
          id: string;
          request_id: string;
          substitute_id: string;
          notified_at: string;
          notification_method: string;
        };
        Insert: Omit<Database['public']['Tables']['request_matches']['Row'], 'id' | 'notified_at'>;
      };
      request_acceptances: {
        Row: {
          id: string;
          request_id: string;
          substitute_id: string;
          accepted_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['request_acceptances']['Row'], 'id' | 'accepted_at' | 'created_at'>;
      };
    };
  };
};
