export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
      }
      safaris: {
        Row: {
          id: string
          title: string
          location: string
          duration: string
          price: number
          rating: number
          reviews: number
          image: string
          description: string
          highlights: string[]
          category: string
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          location: string
          duration: string
          price: number
          rating?: number
          reviews?: number
          image: string
          description: string
          highlights?: string[]
          category: string
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          location?: string
          duration?: string
          price?: number
          rating?: number
          reviews?: number
          image?: string
          description?: string
          highlights?: string[]
          category?: string
          stripe_price_id?: string | null
          updated_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          description: string
          image: string
          safari_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          country: string
          description: string
          image: string
          safari_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          description?: string
          image?: string
          safari_count?: number
          updated_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          excerpt: string
          image: string
          date: string
          category: string
          read_time: string
          content: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          excerpt: string
          image: string
          date: string
          category: string
          read_time: string
          content: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string
          image?: string
          date?: string
          category?: string
          read_time?: string
          content?: string
          status?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          safari_id: string
          safari_title: string
          preferred_date: string
          guests: number
          total_amount: number
          currency: string
          notes: string | null
          user_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          safari_id: string
          safari_title: string
          preferred_date: string
          guests: number
          total_amount: number
          currency?: string
          notes?: string | null
          user_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          safari_id?: string
          safari_title?: string
          preferred_date?: string
          guests?: number
          total_amount?: number
          currency?: string
          notes?: string | null
          user_id?: string
          status?: string
          updated_at?: string
        }
      }
      inquiry_submissions: {
        Row: {
          id: string
          inquiry_type: string
          full_name: string
          email: string
          phone: string | null
          subject: string | null
          message: string | null
          safari_id: string | null
          safari_title: string | null
          preferred_date: string | null
          guests: string | null
          status: string
          google_sync_attempted_at: string | null
          google_sync_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inquiry_type: string
          full_name: string
          email: string
          phone?: string | null
          subject?: string | null
          message?: string | null
          safari_id?: string | null
          safari_title?: string | null
          preferred_date?: string | null
          guests?: string | null
          status?: string
          google_sync_attempted_at?: string | null
          google_sync_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inquiry_type?: string
          full_name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          message?: string | null
          safari_id?: string | null
          safari_title?: string | null
          preferred_date?: string | null
          guests?: string | null
          status?: string
          google_sync_attempted_at?: string | null
          google_sync_error?: string | null
          updated_at?: string
        }
      }
      carousel_images: {
        Row: {
          id: string
          url: string
          title: string
          description: string | null
          order: number
          section?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          url: string
          title: string
          description?: string | null
          order: number
          section?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          title?: string
          description?: string | null
          order?: number
          section?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
