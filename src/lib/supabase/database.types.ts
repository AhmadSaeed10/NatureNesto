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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      customers: CompactTable<{ id: string; user_id: string | null; email: string; full_name: string | null; phone: string | null; accepts_marketing: boolean; tags: string[]; deleted_at: string | null; created_at: string; updated_at: string }, "id" | "user_id" | "full_name" | "phone" | "accepts_marketing" | "tags" | "deleted_at" | "created_at" | "updated_at", []>
      addresses: CompactTable<{ id: string; customer_id: string; full_name: string; phone: string; line1: string; line2: string | null; area: string | null; city: string; province: string | null; postal_code: string | null; country: string; is_default: boolean; created_at: string; updated_at: string }, "id" | "line2" | "area" | "province" | "postal_code" | "country" | "is_default" | "created_at" | "updated_at", [{ foreignKeyName: "addresses_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "customers"; referencedColumns: ["id"] }]>
      shipping_zones: CompactTable<{ id: string; name: string; cities: string[]; is_default: boolean; position: number; created_at: string; updated_at: string }, "id" | "cities" | "is_default" | "position" | "created_at" | "updated_at", []>
      shipping_rates: CompactTable<{ id: string; zone_id: string; name: string; price: number; free_over: number | null; active: boolean; created_at: string; updated_at: string }, "id" | "free_over" | "active" | "created_at" | "updated_at", [{ foreignKeyName: "shipping_rates_zone_id_fkey"; columns: ["zone_id"]; isOneToOne: false; referencedRelation: "shipping_zones"; referencedColumns: ["id"] }]>
      tax_settings: CompactTable<{ id: string; singleton: boolean; prices_include_tax: boolean; rate_bps: number; label: string; created_at: string; updated_at: string }, "id" | "singleton" | "prices_include_tax" | "rate_bps" | "label" | "created_at" | "updated_at", []>
      payment_methods: CompactTable<{ id: string; code: string; name: string; instructions: string | null; enabled: boolean; position: number; created_at: string; updated_at: string }, "id" | "instructions" | "enabled" | "position" | "created_at" | "updated_at", []>
      discount_codes: CompactTable<{ id: string; code: string; kind: Database["public"]["Enums"]["discount_kind"]; value: number; min_subtotal: number; usage_limit: number | null; per_customer_limit: number | null; used_count: number; starts_at: string | null; ends_at: string | null; active: boolean; created_at: string; updated_at: string }, "id" | "value" | "min_subtotal" | "usage_limit" | "per_customer_limit" | "used_count" | "starts_at" | "ends_at" | "active" | "created_at" | "updated_at", []>
      carts: CompactTable<{ id: string; token: string; customer_id: string | null; status: string; discount_code: string | null; created_at: string; updated_at: string }, "id" | "token" | "customer_id" | "status" | "discount_code" | "created_at" | "updated_at", [{ foreignKeyName: "carts_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "customers"; referencedColumns: ["id"] }]>
      cart_items: CompactTable<{ id: string; cart_id: string; variant_id: string; quantity: number; created_at: string; updated_at: string }, "id" | "created_at" | "updated_at", [{ foreignKeyName: "cart_items_cart_id_fkey"; columns: ["cart_id"]; isOneToOne: false; referencedRelation: "carts"; referencedColumns: ["id"] }, { foreignKeyName: "cart_items_variant_id_fkey"; columns: ["variant_id"]; isOneToOne: false; referencedRelation: "product_variants"; referencedColumns: ["id"] }]>
      orders: CompactTable<{ id: string; number: number; access_token: string; customer_id: string | null; email: string; phone: string; full_name: string; shipping_address: Json; notes: string | null; currency: string; subtotal: number; discount_total: number; shipping_total: number; tax_total: number; total: number; discount_code: string | null; payment_method: string; status: Database["public"]["Enums"]["order_status"]; payment_status: Database["public"]["Enums"]["payment_status"]; fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]; placed_at: string; cancelled_at: string | null; created_at: string; updated_at: string }, "id" | "number" | "access_token" | "customer_id" | "notes" | "currency" | "discount_total" | "shipping_total" | "tax_total" | "discount_code" | "status" | "payment_status" | "fulfillment_status" | "placed_at" | "cancelled_at" | "created_at" | "updated_at", [{ foreignKeyName: "orders_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "customers"; referencedColumns: ["id"] }]>
      order_items: CompactTable<{ id: string; order_id: string; product_id: string | null; variant_id: string | null; title: string; variant_title: string | null; sku: string | null; image_url: string | null; unit_price: number; quantity: number; line_total: number; created_at: string; updated_at: string }, "id" | "product_id" | "variant_id" | "variant_title" | "sku" | "image_url" | "created_at" | "updated_at", [{ foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }, { foreignKeyName: "order_items_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }, { foreignKeyName: "order_items_variant_id_fkey"; columns: ["variant_id"]; isOneToOne: false; referencedRelation: "product_variants"; referencedColumns: ["id"] }]>
      order_status_history: CompactTable<{ id: string; order_id: string; status: string; note: string | null; actor_id: string | null; created_at: string; updated_at: string }, "id" | "note" | "actor_id" | "created_at" | "updated_at", [{ foreignKeyName: "order_status_history_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]>
      fulfillments: CompactTable<{ id: string; order_id: string; carrier: string | null; tracking_number: string | null; tracking_url: string | null; shipped_at: string | null; created_at: string; updated_at: string }, "id" | "carrier" | "tracking_number" | "tracking_url" | "shipped_at" | "created_at" | "updated_at", [{ foreignKeyName: "fulfillments_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]>
      payments: CompactTable<{ id: string; order_id: string; provider: string; status: string; amount: number; reference: string | null; raw_payload: Json | null; created_at: string; updated_at: string }, "id" | "status" | "reference" | "raw_payload" | "created_at" | "updated_at", [{ foreignKeyName: "payments_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]>
      refunds: CompactTable<{ id: string; order_id: string; amount: number; reason: string | null; created_at: string; updated_at: string }, "id" | "reason" | "created_at" | "updated_at", [{ foreignKeyName: "refunds_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]>
      discount_applications: CompactTable<{ id: string; order_id: string; code: string; kind: Database["public"]["Enums"]["discount_kind"]; amount: number; created_at: string; updated_at: string }, "id" | "created_at" | "updated_at", [{ foreignKeyName: "discount_applications_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }]>
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["staff_role"] | null
          after: Json | null
          before: Json | null
          created_at: string
          id: string
          record_id: string | null
          table_name: string
          updated_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["staff_role"] | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name: string
          updated_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["staff_role"] | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body: Json | null
          cover_media_id: string | null
          created_at: string
          excerpt: string | null
          handle: string
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: Json | null
          cover_media_id?: string | null
          created_at?: string
          excerpt?: string | null
          handle: string
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: Json | null
          cover_media_id?: string | null
          created_at?: string
          excerpt?: string | null
          handle?: string
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          handle: string
          id: string
          name: string
          parent_id: string | null
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          handle: string
          id?: string
          name: string
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          handle?: string
          id?: string
          name?: string
          parent_id?: string | null
          position?: number
          updated_at?: string
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
      collection_products: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          position: number
          product_id: string
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          position?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          handle: string
          id: string
          image_id: string | null
          kind: string
          position: number
          rules: Json
          seo_description: string | null
          seo_title: string | null
          sort_order: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          handle: string
          id?: string
          image_id?: string | null
          kind?: string
          position?: number
          rules?: Json
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          handle?: string
          id?: string
          image_id?: string | null
          kind?: string
          position?: number
          rules?: Json
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          area: string | null
          assigned_to: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          service_id: string | null
          source: Database["public"]["Enums"]["lead_source"]
          space_type: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          area?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          service_id?: string | null
          source: Database["public"]["Enums"]["lead_source"]
          space_type?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          area?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          service_id?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          space_type?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: Json
          category: string | null
          created_at: string
          id: string
          position: number
          question: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          answer: Json
          category?: string | null
          created_at?: string
          id?: string
          position?: number
          question: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          answer?: Json
          category?: string | null
          created_at?: string
          id?: string
          position?: number
          question?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      gift_bundles: {
        Row: {
          compare_at_price: number | null
          cover_media_id: string | null
          created_at: string
          description: Json | null
          handle: string
          id: string
          items: Json
          price: number
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
        }
        Insert: {
          compare_at_price?: number | null
          cover_media_id?: string | null
          created_at?: string
          description?: Json | null
          handle: string
          id?: string
          items?: Json
          price: number
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
        }
        Update: {
          compare_at_price?: number | null
          cover_media_id?: string | null
          created_at?: string
          description?: Json | null
          handle?: string
          id?: string
          items?: Json
          price?: number
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_bundles_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_adjustments: {
        Row: {
          actor_id: string | null
          created_at: string
          delta: number
          id: string
          note: string | null
          reason: Database["public"]["Enums"]["stock_reason"]
          stock_after: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          delta: number
          id?: string
          note?: string | null
          reason: Database["public"]["Enums"]["stock_reason"]
          stock_after: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          note?: string | null
          reason?: Database["public"]["Enums"]["stock_reason"]
          stock_after?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt: string
          created_at: string
          created_by: string | null
          decorative: boolean
          external_url: string | null
          height: number | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string | null
          title: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          alt?: string
          created_at?: string
          created_by?: string | null
          decorative?: boolean
          external_url?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt?: string
          created_at?: string
          created_by?: string | null
          decorative?: boolean
          external_url?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          href: string
          id: string
          label: string
          menu_id: string
          parent_id: string | null
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          label: string
          menu_id: string
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          label?: string
          menu_id?: string
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          created_at: string
          handle: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          handle: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          handle?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_section_drafts: {
        Row: {
          created_at: string
          data: Json
          id: string
          section_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          section_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_section_drafts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: true
            referencedRelation: "page_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          created_at: string
          data: Json
          id: string
          page_id: string
          position: number
          status: Database["public"]["Enums"]["content_status"]
          type: Database["public"]["Enums"]["page_section_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          page_id: string
          position?: number
          status?: Database["public"]["Enums"]["content_status"]
          type: Database["public"]["Enums"]["page_section_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          page_id?: string
          position?: number
          status?: Database["public"]["Enums"]["content_status"]
          type?: Database["public"]["Enums"]["page_section_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          body: Json | null
          created_at: string
          handle: string
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json | null
          created_at?: string
          handle: string
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json | null
          created_at?: string
          handle?: string
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          media_id: string
          position: number
          product_id: string
          updated_at: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          media_id: string
          position?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          media_id?: string
          position?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_metafields: {
        Row: {
          created_at: string
          id: string
          key: string
          namespace: string
          product_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          namespace?: string
          product_id: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          namespace?: string
          product_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_metafields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          product_id: string
          updated_at: string
          values: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          product_id: string
          updated_at?: string
          values?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          product_id?: string
          updated_at?: string
          values?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          allow_backorder: boolean
          compare_at_price: number | null
          cost: number | null
          created_at: string
          id: string
          low_stock_threshold: number
          option_values: Json
          position: number
          price: number
          product_id: string
          sku: string | null
          stock: number
          title: string
          track_inventory: boolean
          updated_at: string
          weight_g: number | null
        }
        Insert: {
          allow_backorder?: boolean
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number
          option_values?: Json
          position?: number
          price: number
          product_id: string
          sku?: string | null
          stock?: number
          title?: string
          track_inventory?: boolean
          updated_at?: string
          weight_g?: number | null
        }
        Update: {
          allow_backorder?: boolean
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number
          option_values?: Json
          position?: number
          price?: number
          product_id?: string
          sku?: string | null
          stock?: number
          title?: string
          track_inventory?: boolean
          updated_at?: string
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: Json | null
          handle: string
          id: string
          product_type: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          status: Database["public"]["Enums"]["product_status"]
          tags: string[]
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: Json | null
          handle: string
          id?: string
          product_type?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: Json | null
          handle?: string
          id?: string
          product_type?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["staff_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["staff_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["staff_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          hits: number
          id: string
          key: string
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          hits?: number
          id?: string
          key: string
          updated_at?: string
          window_start: string
        }
        Update: {
          created_at?: string
          hits?: number
          id?: string
          key?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          destination: string
          id: string
          permanent: boolean
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          permanent?: boolean
          source: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          permanent?: boolean
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          body: Json | null
          cover_media_id: string | null
          created_at: string
          featured: boolean
          handle: string
          icon: string | null
          id: string
          position: number
          seo_description: string | null
          seo_title: string | null
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json | null
          cover_media_id?: string | null
          created_at?: string
          featured?: boolean
          handle: string
          icon?: string | null
          id?: string
          position?: number
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json | null
          cover_media_id?: string | null
          created_at?: string
          featured?: boolean
          handle?: string
          icon?: string | null
          id?: string
          position?: number
          seo_description?: string | null
          seo_title?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string
          announcement: Json
          created_at: string
          currency: string
          email: string
          id: string
          legal: string | null
          logo_media_id: string | null
          phones: Json
          seo: Json
          singleton: boolean
          socials: Json
          store_name: string
          taglines: Json
          updated_at: string
        }
        Insert: {
          address: string
          announcement?: Json
          created_at?: string
          currency?: string
          email: string
          id?: string
          legal?: string | null
          logo_media_id?: string | null
          phones?: Json
          seo?: Json
          singleton?: boolean
          socials?: Json
          store_name: string
          taglines?: Json
          updated_at?: string
        }
        Update: {
          address?: string
          announcement?: Json
          created_at?: string
          currency?: string
          email?: string
          id?: string
          legal?: string | null
          logo_media_id?: string | null
          phones?: Json
          seo?: Json
          singleton?: boolean
          socials?: Json
          store_name?: string
          taglines?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Relationships: []
      }
      styling_quotes: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          id: string
          line_items: Json
          notes: string | null
          reference: string
          request_id: string | null
          status: Database["public"]["Enums"]["quote_status"]
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          line_items?: Json
          notes?: string | null
          reference: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          line_items?: Json
          notes?: string | null
          reference?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "styling_quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "styling_quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          body: Json | null
          capacity: number | null
          cover_media_id: string | null
          created_at: string
          ends_at: string | null
          handle: string
          id: string
          location: string | null
          price: number | null
          published_at: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json | null
          capacity?: number | null
          cover_media_id?: string | null
          created_at?: string
          ends_at?: string | null
          handle: string
          id?: string
          location?: string | null
          price?: number | null
          published_at?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json | null
          capacity?: number | null
          cover_media_id?: string | null
          created_at?: string
          ends_at?: string | null
          handle?: string
          id?: string
          location?: string | null
          price?: number | null
          published_at?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshops_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_delta: number
          p_note?: string
          p_reason: Database["public"]["Enums"]["stock_reason"]
          p_variant_id: string
        }
        Returns: number
      }
      duplicate_product: { Args: { p_id: string }; Returns: string }
      hit_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      media_usage: {
        Args: { p_media_ids: string[] }
        Returns: {
          media_id: string
          uses: number
        }[]
      }
      place_order: { Args: { p: Json }; Returns: Json }
      quote_cart: { Args: { p: Json }; Returns: Json }
      save_product: { Args: { p: Json }; Returns: string }
    }
    Enums: {
      content_status: "draft" | "published"
      discount_kind: "percentage" | "fixed" | "free_shipping"
      fulfillment_status: "unfulfilled" | "partial" | "fulfilled"
      order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
      payment_status: "unpaid" | "paid" | "refunded" | "partially_refunded"
      lead_source: "contact" | "consultation" | "quote" | "whatsapp" | "other"
      lead_status: "new" | "contacted" | "quoted" | "won" | "lost"
      page_section_type:
        | "hero"
        | "tagline"
        | "value_props"
        | "how_it_works"
        | "services"
        | "banner"
        | "plants"
        | "need_help"
        | "rich_text"
      product_status: "draft" | "active" | "archived"
      quote_status: "draft" | "sent" | "accepted" | "declined" | "expired"
      staff_role: "owner" | "admin" | "editor" | "support"
      stock_reason:
        | "initial"
        | "received"
        | "correction"
        | "damaged"
        | "returned"
        | "sold"
        | "import"
        | "other"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      content_status: ["draft", "published"],
      discount_kind: ["percentage", "fixed", "free_shipping"],
      fulfillment_status: ["unfulfilled", "partial", "fulfilled"],
      order_status: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      payment_status: ["unpaid", "paid", "refunded", "partially_refunded"],
      lead_source: ["contact", "consultation", "quote", "whatsapp", "other"],
      lead_status: ["new", "contacted", "quoted", "won", "lost"],
      page_section_type: [
        "hero",
        "tagline",
        "value_props",
        "how_it_works",
        "services",
        "banner",
        "plants",
        "need_help",
        "rich_text",
      ],
      product_status: ["draft", "active", "archived"],
      quote_status: ["draft", "sent", "accepted", "declined", "expired"],
      staff_role: ["owner", "admin", "editor", "support"],
      stock_reason: [
        "initial",
        "received",
        "correction",
        "damaged",
        "returned",
        "sold",
        "import",
        "other",
      ],
    },
  },
} as const

// Hand written for tables added while the type generator could not reach the project;
// the shape matches `supabase gen types` output. Regenerate to replace these.
type CompactTable<Row, Optional extends keyof Row, Relationships extends unknown[]> = {
  Row: Row
  Insert: Omit<Row, Optional> & Partial<Pick<Row, Optional>>
  Update: Partial<Row>
  Relationships: Relationships
}
