export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          media_type: string | null
          position: string | null
          sort_order: number | null
          title_ar: string | null
          title_en: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          media_type?: string | null
          position?: string | null
          sort_order?: number | null
          title_ar?: string | null
          title_en?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          media_type?: string | null
          position?: string | null
          sort_order?: number | null
          title_ar?: string | null
          title_en?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      blog_post_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          post_id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          post_id: string
          source?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          post_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_events_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content_ar: string | null
          content_en: string | null
          created_at: string
          excerpt_ar: string | null
          excerpt_en: string | null
          featured_image: string | null
          id: string
          status: string | null
          tags: string[] | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_image?: string | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name_ar: string
          name_en: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name_ar: string
          name_en: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name_ar?: string
          name_en?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cctv_quote_reminders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          quote_id: string | null
          reminder_date: string
          reminder_type: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string | null
          reminder_date: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string | null
          reminder_date?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cctv_quote_reminders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "cctv_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      cctv_quotes: {
        Row: {
          client_email: string | null
          client_location: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          created_by: string | null
          customer_type: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          project_data: Json
          quote_number: string
          results_data: Json
          status: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          client_email?: string | null
          client_location?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          project_data?: Json
          quote_number: string
          results_data?: Json
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string | null
          client_location?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          project_data?: Json
          quote_number?: string
          results_data?: Json
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          start_date: string | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          customer_type: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          body: string
          campaign_id: string | null
          clicked_at: string | null
          created_at: string
          error_message: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          tracking_id: string | null
        }
        Insert: {
          body: string
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          tracking_id?: string | null
        }
        Update: {
          body?: string
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          tracking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          banner_image: string | null
          body_ar: string
          body_en: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject_ar: string
          subject_en: string
          type: string
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          body_ar: string
          body_en: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject_ar: string
          subject_en: string
          type?: string
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          body_ar?: string
          body_en?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject_ar?: string
          subject_en?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      machine_quote_reminders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          quote_id: string | null
          reminder_date: string
          reminder_type: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string | null
          reminder_date: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string | null
          reminder_date?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "machine_quote_reminders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "machine_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_quotes: {
        Row: {
          client_email: string | null
          client_location: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          created_by: string | null
          customer_type: string | null
          follow_up_date: string | null
          id: string
          industry_type: string | null
          notes: string | null
          quote_number: string
          requirements: Json
          results_data: Json
          selected_machines: Json
          status: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          client_email?: string | null
          client_location?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          follow_up_date?: string | null
          id?: string
          industry_type?: string | null
          notes?: string | null
          quote_number: string
          requirements?: Json
          results_data?: Json
          selected_machines?: Json
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string | null
          client_location?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          follow_up_date?: string | null
          id?: string
          industry_type?: string | null
          notes?: string | null
          quote_number?: string
          requirements?: Json
          results_data?: Json
          selected_machines?: Json
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_audience: string | null
          template_id: string | null
          total_recipients: number | null
          total_sent: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string | null
          template_id?: string | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string | null
          template_id?: string | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          reply: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          reply?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          reply?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          is_read: boolean
          message: string
          order_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          is_read?: boolean
          message: string
          order_id?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          order_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_shipping_status: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shipping_status_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: string | null
          shipping_amount: number | null
          status: string
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_amount?: number | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_amount?: number | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string
          created_at: string
          customer_email: string | null
          customer_name: string
          id: string
          images: string[] | null
          is_approved: boolean | null
          is_verified: boolean | null
          product_id: string
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id: string
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          discount_price: number | null
          id: string
          images: string[] | null
          min_stock_alert: number | null
          name_ar: string
          name_en: string
          price: number
          specifications: Json | null
          status: string
          stock_quantity: number
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          discount_price?: number | null
          id?: string
          images?: string[] | null
          min_stock_alert?: number | null
          name_ar: string
          name_en: string
          price?: number
          specifications?: Json | null
          status?: string
          stock_quantity?: number
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          discount_price?: number | null
          id?: string
          images?: string[] | null
          min_stock_alert?: number | null
          name_ar?: string
          name_en?: string
          price?: number
          specifications?: Json | null
          status?: string
          stock_quantity?: number
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      solar_component_pricing: {
        Row: {
          component_key: string
          component_name_ar: string
          component_name_en: string | null
          currency: string | null
          id: string
          price: number
          unit: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          component_key: string
          component_name_ar: string
          component_name_en?: string | null
          currency?: string | null
          id?: string
          price: number
          unit: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          component_key?: string
          component_name_ar?: string
          component_name_en?: string | null
          currency?: string | null
          id?: string
          price?: number
          unit?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      solar_pricing_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          component_key: string
          id: string
          new_price: number
          old_price: number | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          component_key: string
          id?: string
          new_price: number
          old_price?: number | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          component_key?: string
          id?: string
          new_price?: number
          old_price?: number | null
        }
        Relationships: []
      }
      solar_quote_reminders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          quote_id: string | null
          reminder_date: string
          reminder_type: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string | null
          reminder_date: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string | null
          reminder_date?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solar_quote_reminders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "solar_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      solar_quotes: {
        Row: {
          client_email: string | null
          client_location: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          created_by: string | null
          customer_type: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          quote_number: string
          results_data: Json
          status: string | null
          system_data: Json
          system_type: string
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          client_email?: string | null
          client_location?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          quote_number: string
          results_data?: Json
          status?: string | null
          system_data?: Json
          system_type: string
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string | null
          client_location?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          quote_number?: string
          results_data?: Json
          status?: string | null
          system_data?: Json
          system_type?: string
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
