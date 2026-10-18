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
      hit_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      content_status: "draft" | "published"
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
    },
  },
} as const
