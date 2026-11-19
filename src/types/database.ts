export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          actor_role: Database["public"]["Enums"]["app_role"] | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: number;
          metadata: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          action: string;
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["app_role"] | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: never;
          metadata?: NonNullable<Json>;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["app_role"] | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: never;
          metadata?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      app_settings: {
        Row: {
          description: string | null;
          is_public: boolean;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          description?: string | null;
          is_public?: boolean;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: NonNullable<Json>;
        };
        Update: {
          description?: string | null;
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      appliances: {
        Row: {
          created_at: string;
          description_ar: string | null;
          id: string;
          is_active: boolean;
          key: string;
          name_ar: string;
          prompt_hint: string | null;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description_ar?: string | null;
          id?: string;
          is_active?: boolean;
          key: string;
          name_ar: string;
          prompt_hint?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description_ar?: string | null;
          id?: string;
          is_active?: boolean;
          key?: string;
          name_ar?: string;
          prompt_hint?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          address_id: string | null;
          address_text: string;
          cancellation_reason: string | null;
          contact_name: string;
          contact_phone: string;
          created_at: string;
          created_by: string | null;
          customer_id: string;
          customer_notes: string | null;
          final_measurement_id: string | null;
          id: string;
          project_id: string;
          requested_date: string;
          requested_time_slot: string;
          scheduled_at: string | null;
          status: Database["public"]["Enums"]["appointment_status"];
          technician_id: string | null;
          technician_notes: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          address_id?: string | null;
          address_text: string;
          cancellation_reason?: string | null;
          contact_name: string;
          contact_phone: string;
          created_at?: string;
          created_by?: string | null;
          customer_id: string;
          customer_notes?: string | null;
          final_measurement_id?: string | null;
          id?: string;
          project_id: string;
          requested_date: string;
          requested_time_slot: string;
          scheduled_at?: string | null;
          status?: Database["public"]["Enums"]["appointment_status"];
          technician_id?: string | null;
          technician_notes?: string | null;
          updated_at?: string;
        };
        Update: {
          address_id?: string | null;
          address_text?: string;
          cancellation_reason?: string | null;
          contact_name?: string;
          contact_phone?: string;
          created_at?: string;
          created_by?: string | null;
          customer_id?: string;
          customer_notes?: string | null;
          final_measurement_id?: string | null;
          id?: string;
          project_id?: string;
          requested_date?: string;
          requested_time_slot?: string;
          scheduled_at?: string | null;
          status?: Database["public"]["Enums"]["appointment_status"];
          technician_id?: string | null;
          technician_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_address_id_fkey";
            columns: ["address_id"];
            isOneToOne: false;
            referencedRelation: "customer_addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_final_measurement_id_fkey";
            columns: ["final_measurement_id"];
            isOneToOne: false;
            referencedRelation: "room_measurements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_technician_id_fkey";
            columns: ["technician_id"];
            isOneToOne: false;
            referencedRelation: "technicians";
            referencedColumns: ["id"];
          },
        ];
      };
      commissions: {
        Row: {
          amount: number;
          base_amount: number;
          base_type: string;
          created_at: string;
          due_date: string | null;
          id: string;
          manufacturer_id: string;
          manufacturer_net: number;
          order_id: string;
          order_value: number;
          rate: number;
          settlement_id: string | null;
          status: Database["public"]["Enums"]["commission_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          base_amount: number;
          base_type?: string;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          manufacturer_id: string;
          manufacturer_net: number;
          order_id: string;
          order_value: number;
          rate: number;
          settlement_id?: string | null;
          status?: Database["public"]["Enums"]["commission_status"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          base_amount?: number;
          base_type?: string;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          manufacturer_id?: string;
          manufacturer_net?: number;
          order_id?: string;
          order_value?: number;
          rate?: number;
          settlement_id?: string | null;
          status?: Database["public"]["Enums"]["commission_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commissions_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_settlement_id_fkey";
            columns: ["settlement_id"];
            isOneToOne: false;
            referencedRelation: "settlements";
            referencedColumns: ["id"];
          },
        ];
      };
      complaint_replies: {
        Row: {
          author_id: string;
          body: string;
          complaint_id: string;
          created_at: string;
          id: string;
          is_internal: boolean;
        };
        ComputedFields: never;
        Insert: {
          author_id: string;
          body: string;
          complaint_id: string;
          created_at?: string;
          id?: string;
          is_internal?: boolean;
        };
        Update: {
          author_id?: string;
          body?: string;
          complaint_id?: string;
          created_at?: string;
          id?: string;
          is_internal?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "complaint_replies_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaint_replies_complaint_id_fkey";
            columns: ["complaint_id"];
            isOneToOne: false;
            referencedRelation: "complaints";
            referencedColumns: ["id"];
          },
        ];
      };
      complaints: {
        Row: {
          assigned_to: string | null;
          body: string;
          created_at: string;
          customer_id: string;
          id: string;
          kind: Database["public"]["Enums"]["complaint_kind"];
          order_id: string | null;
          project_id: string | null;
          resolution: string | null;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["complaint_status"];
          subject: string;
          updated_at: string;
          warranty_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          assigned_to?: string | null;
          body: string;
          created_at?: string;
          customer_id: string;
          id?: string;
          kind?: Database["public"]["Enums"]["complaint_kind"];
          order_id?: string | null;
          project_id?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["complaint_status"];
          subject: string;
          updated_at?: string;
          warranty_id?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          body?: string;
          created_at?: string;
          customer_id?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["complaint_kind"];
          order_id?: string | null;
          project_id?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["complaint_status"];
          subject?: string;
          updated_at?: string;
          warranty_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaints_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaints_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaints_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaints_warranty_id_fkey";
            columns: ["warranty_id"];
            isOneToOne: false;
            referencedRelation: "warranties";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string;
          handled_at: string | null;
          handled_by: string | null;
          id: string;
          ip_hash: string | null;
          message: string;
          phone: string;
          topic: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name: string;
          handled_at?: string | null;
          handled_by?: string | null;
          id?: string;
          ip_hash?: string | null;
          message: string;
          phone: string;
          topic: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string;
          handled_at?: string | null;
          handled_by?: string | null;
          id?: string;
          ip_hash?: string | null;
          message?: string;
          phone?: string;
          topic?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contact_messages_handled_by_fkey";
            columns: ["handled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_addresses: {
        Row: {
          city: string;
          created_at: string;
          details: string | null;
          district: string;
          id: string;
          is_default: boolean;
          label: string;
          latitude: number | null;
          longitude: number | null;
          street: string | null;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          city?: string;
          created_at?: string;
          details?: string | null;
          district: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          latitude?: number | null;
          longitude?: number | null;
          street?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          details?: string | null;
          district?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          latitude?: number | null;
          longitude?: number | null;
          street?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      design_options: {
        Row: {
          category: Database["public"]["Enums"]["option_category"];
          created_at: string;
          description_ar: string | null;
          hex_color: string | null;
          id: string;
          image_path: string | null;
          is_active: boolean;
          key: string;
          name_ar: string;
          prompt_hint: string | null;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          category: Database["public"]["Enums"]["option_category"];
          created_at?: string;
          description_ar?: string | null;
          hex_color?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          key: string;
          name_ar: string;
          prompt_hint?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["option_category"];
          created_at?: string;
          description_ar?: string | null;
          hex_color?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          key?: string;
          name_ar?: string;
          prompt_hint?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      design_session_items: {
        Row: {
          appliance_id: string | null;
          created_at: string;
          design_session_id: string;
          id: string;
          option_id: string | null;
          product_id: string | null;
          quantity: number;
        };
        ComputedFields: never;
        Insert: {
          appliance_id?: string | null;
          created_at?: string;
          design_session_id: string;
          id?: string;
          option_id?: string | null;
          product_id?: string | null;
          quantity?: number;
        };
        Update: {
          appliance_id?: string | null;
          created_at?: string;
          design_session_id?: string;
          id?: string;
          option_id?: string | null;
          product_id?: string | null;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "design_session_items_appliance_id_fkey";
            columns: ["appliance_id"];
            isOneToOne: false;
            referencedRelation: "appliances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_session_items_design_session_id_fkey";
            columns: ["design_session_id"];
            isOneToOne: false;
            referencedRelation: "design_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_session_items_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "design_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_session_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      design_sessions: {
        Row: {
          cabinet_material_id: string | null;
          color_option_id: string | null;
          countertop_material_id: string | null;
          created_at: string;
          custom_color: string | null;
          customer_id: string;
          id: string;
          is_current: boolean;
          notes: string | null;
          project_id: string;
          status: Database["public"]["Enums"]["design_status"];
          style_option_id: string | null;
          updated_at: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          cabinet_material_id?: string | null;
          color_option_id?: string | null;
          countertop_material_id?: string | null;
          created_at?: string;
          custom_color?: string | null;
          customer_id: string;
          id?: string;
          is_current?: boolean;
          notes?: string | null;
          project_id: string;
          status?: Database["public"]["Enums"]["design_status"];
          style_option_id?: string | null;
          updated_at?: string;
          version?: number;
        };
        Update: {
          cabinet_material_id?: string | null;
          color_option_id?: string | null;
          countertop_material_id?: string | null;
          created_at?: string;
          custom_color?: string | null;
          customer_id?: string;
          id?: string;
          is_current?: boolean;
          notes?: string | null;
          project_id?: string;
          status?: Database["public"]["Enums"]["design_status"];
          style_option_id?: string | null;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "design_sessions_cabinet_material_id_fkey";
            columns: ["cabinet_material_id"];
            isOneToOne: false;
            referencedRelation: "materials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_sessions_color_option_id_fkey";
            columns: ["color_option_id"];
            isOneToOne: false;
            referencedRelation: "design_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_sessions_countertop_material_id_fkey";
            columns: ["countertop_material_id"];
            isOneToOne: false;
            referencedRelation: "materials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_sessions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_sessions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "design_sessions_style_option_id_fkey";
            columns: ["style_option_id"];
            isOneToOne: false;
            referencedRelation: "design_options";
            referencedColumns: ["id"];
          },
        ];
      };
      generated_designs: {
        Row: {
          cost_estimate_usd: number | null;
          created_at: string;
          customer_id: string;
          design_session_id: string;
          duration_ms: number | null;
          error_message: string | null;
          id: string;
          model: string | null;
          project_id: string;
          prompt: string | null;
          provider: string;
          source_image_id: string | null;
          status: Database["public"]["Enums"]["generation_status"];
          storage_path: string | null;
        };
        ComputedFields: never;
        Insert: {
          cost_estimate_usd?: number | null;
          created_at?: string;
          customer_id: string;
          design_session_id: string;
          duration_ms?: number | null;
          error_message?: string | null;
          id?: string;
          model?: string | null;
          project_id: string;
          prompt?: string | null;
          provider: string;
          source_image_id?: string | null;
          status?: Database["public"]["Enums"]["generation_status"];
          storage_path?: string | null;
        };
        Update: {
          cost_estimate_usd?: number | null;
          created_at?: string;
          customer_id?: string;
          design_session_id?: string;
          duration_ms?: number | null;
          error_message?: string | null;
          id?: string;
          model?: string | null;
          project_id?: string;
          prompt?: string | null;
          provider?: string;
          source_image_id?: string | null;
          status?: Database["public"]["Enums"]["generation_status"];
          storage_path?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "generated_designs_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_designs_design_session_id_fkey";
            columns: ["design_session_id"];
            isOneToOne: false;
            referencedRelation: "design_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_designs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_designs_source_image_id_fkey";
            columns: ["source_image_id"];
            isOneToOne: false;
            referencedRelation: "room_images";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          commission_id: string | null;
          created_at: string;
          created_by: string | null;
          due_date: string | null;
          id: string;
          invoice_number: string;
          issued_at: string | null;
          kind: string;
          manufacturer_id: string;
          order_id: string | null;
          paid_at: string | null;
          pdf_path: string | null;
          settlement_id: string | null;
          status: Database["public"]["Enums"]["invoice_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          vat_amount: number;
          vat_rate: number;
        };
        ComputedFields: never;
        Insert: {
          commission_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          due_date?: string | null;
          id?: string;
          invoice_number?: string;
          issued_at?: string | null;
          kind?: string;
          manufacturer_id: string;
          order_id?: string | null;
          paid_at?: string | null;
          pdf_path?: string | null;
          settlement_id?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          subtotal: number;
          total: number;
          updated_at?: string;
          vat_amount: number;
          vat_rate?: number;
        };
        Update: {
          commission_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          due_date?: string | null;
          id?: string;
          invoice_number?: string;
          issued_at?: string | null;
          kind?: string;
          manufacturer_id?: string;
          order_id?: string | null;
          paid_at?: string | null;
          pdf_path?: string | null;
          settlement_id?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          vat_amount?: number;
          vat_rate?: number;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_commission_id_fkey";
            columns: ["commission_id"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_settlement_id_fkey";
            columns: ["settlement_id"];
            isOneToOne: false;
            referencedRelation: "settlements";
            referencedColumns: ["id"];
          },
        ];
      };
      manufacturer_assignments: {
        Row: {
          assigned_by: string | null;
          created_at: string;
          id: string;
          manufacturer_id: string;
          notes: string | null;
          order_id: string | null;
          project_id: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["assignment_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          assigned_by?: string | null;
          created_at?: string;
          id?: string;
          manufacturer_id: string;
          notes?: string | null;
          order_id?: string | null;
          project_id: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["assignment_status"];
          updated_at?: string;
        };
        Update: {
          assigned_by?: string | null;
          created_at?: string;
          id?: string;
          manufacturer_id?: string;
          notes?: string | null;
          order_id?: string | null;
          project_id?: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["assignment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "manufacturer_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_assignments_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_assignments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_assignments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      manufacturer_prices: {
        Row: {
          appliance_id: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          id: string;
          is_active: boolean;
          is_test_data: boolean;
          item_type: Database["public"]["Enums"]["price_item_type"];
          label_ar: string | null;
          manufacturer_id: string;
          material_id: string | null;
          option_id: string | null;
          price_max: number;
          price_min: number;
          pricing_unit: Database["public"]["Enums"]["pricing_unit"];
          product_id: string | null;
          updated_at: string;
          valid_from: string;
          valid_to: string | null;
        };
        ComputedFields: never;
        Insert: {
          appliance_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          id?: string;
          is_active?: boolean;
          is_test_data?: boolean;
          item_type: Database["public"]["Enums"]["price_item_type"];
          label_ar?: string | null;
          manufacturer_id: string;
          material_id?: string | null;
          option_id?: string | null;
          price_max: number;
          price_min: number;
          pricing_unit: Database["public"]["Enums"]["pricing_unit"];
          product_id?: string | null;
          updated_at?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Update: {
          appliance_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          id?: string;
          is_active?: boolean;
          is_test_data?: boolean;
          item_type?: Database["public"]["Enums"]["price_item_type"];
          label_ar?: string | null;
          manufacturer_id?: string;
          material_id?: string | null;
          option_id?: string | null;
          price_max?: number;
          price_min?: number;
          pricing_unit?: Database["public"]["Enums"]["pricing_unit"];
          product_id?: string | null;
          updated_at?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "manufacturer_prices_appliance_id_fkey";
            columns: ["appliance_id"];
            isOneToOne: false;
            referencedRelation: "appliances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_prices_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_prices_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_prices_material_id_fkey";
            columns: ["material_id"];
            isOneToOne: false;
            referencedRelation: "materials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_prices_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "design_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "manufacturer_prices_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      manufacturers: {
        Row: {
          address: string | null;
          agreement_reference: string | null;
          city: string;
          commission_rate: number | null;
          contact_person: string | null;
          cr_number: string | null;
          created_at: string;
          email: string | null;
          id: string;
          is_public: boolean;
          is_test_data: boolean;
          kitchen_styles: string[];
          legal_name: string | null;
          manufacturing_days_max: number | null;
          manufacturing_days_min: number | null;
          material_keys: string[];
          notes: string | null;
          partnership_status: Database["public"]["Enums"]["partnership_status"];
          phone: string | null;
          trade_name: string;
          updated_at: string;
          vat_number: string | null;
          warranty_terms: string | null;
        };
        ComputedFields: never;
        Insert: {
          address?: string | null;
          agreement_reference?: string | null;
          city?: string;
          commission_rate?: number | null;
          contact_person?: string | null;
          cr_number?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_public?: boolean;
          is_test_data?: boolean;
          kitchen_styles?: string[];
          legal_name?: string | null;
          manufacturing_days_max?: number | null;
          manufacturing_days_min?: number | null;
          material_keys?: string[];
          notes?: string | null;
          partnership_status?: Database["public"]["Enums"]["partnership_status"];
          phone?: string | null;
          trade_name: string;
          updated_at?: string;
          vat_number?: string | null;
          warranty_terms?: string | null;
        };
        Update: {
          address?: string | null;
          agreement_reference?: string | null;
          city?: string;
          commission_rate?: number | null;
          contact_person?: string | null;
          cr_number?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_public?: boolean;
          is_test_data?: boolean;
          kitchen_styles?: string[];
          legal_name?: string | null;
          manufacturing_days_max?: number | null;
          manufacturing_days_min?: number | null;
          material_keys?: string[];
          notes?: string | null;
          partnership_status?: Database["public"]["Enums"]["partnership_status"];
          phone?: string | null;
          trade_name?: string;
          updated_at?: string;
          vat_number?: string | null;
          warranty_terms?: string | null;
        };
        Relationships: [];
      };
      materials: {
        Row: {
          created_at: string;
          description_ar: string | null;
          id: string;
          is_active: boolean;
          key: string;
          kind: Database["public"]["Enums"]["material_kind"];
          name_ar: string;
          prompt_hint: string | null;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description_ar?: string | null;
          id?: string;
          is_active?: boolean;
          key: string;
          kind: Database["public"]["Enums"]["material_kind"];
          name_ar: string;
          prompt_hint?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description_ar?: string | null;
          id?: string;
          is_active?: boolean;
          key?: string;
          kind?: Database["public"]["Enums"]["material_kind"];
          name_ar?: string;
          prompt_hint?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_deliveries: {
        Row: {
          channel: string;
          created_at: string;
          error: string | null;
          id: string;
          notification_id: string;
          provider: string | null;
          provider_reference: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          channel: string;
          created_at?: string;
          error?: string | null;
          id?: string;
          notification_id: string;
          provider?: string | null;
          provider_reference?: string | null;
          status?: string;
        };
        Update: {
          channel?: string;
          created_at?: string;
          error?: string | null;
          id?: string;
          notification_id?: string;
          provider?: string | null;
          provider_reference?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          link: string | null;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          body?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: Database["public"]["Enums"]["order_status"] | null;
          id: number;
          note: string | null;
          order_id: string;
          to_status: Database["public"]["Enums"]["order_status"];
        };
        ComputedFields: never;
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["order_status"] | null;
          id?: never;
          note?: string | null;
          order_id: string;
          to_status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["order_status"] | null;
          id?: never;
          note?: string | null;
          order_id?: string;
          to_status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          accepted_quotation_id: string | null;
          cancellation_reason: string | null;
          created_at: string;
          customer_id: string;
          design_session_id: string | null;
          estimate_max: number | null;
          estimate_min: number | null;
          id: string;
          manufacturer_id: string | null;
          order_number: string;
          project_id: string;
          status: Database["public"]["Enums"]["order_status"];
          total_amount: number | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          accepted_quotation_id?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          customer_id: string;
          design_session_id?: string | null;
          estimate_max?: number | null;
          estimate_min?: number | null;
          id?: string;
          manufacturer_id?: string | null;
          order_number?: string;
          project_id: string;
          status?: Database["public"]["Enums"]["order_status"];
          total_amount?: number | null;
          updated_at?: string;
        };
        Update: {
          accepted_quotation_id?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          customer_id?: string;
          design_session_id?: string | null;
          estimate_max?: number | null;
          estimate_min?: number | null;
          id?: string;
          manufacturer_id?: string | null;
          order_number?: string;
          project_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
          total_amount?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_accepted_quotation_fk";
            columns: ["accepted_quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_design_session_id_fkey";
            columns: ["design_session_id"];
            isOneToOne: false;
            referencedRelation: "design_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          customer_id: string;
          id: string;
          method: string;
          notes: string | null;
          order_id: string;
          paid_at: string | null;
          payee: Database["public"]["Enums"]["payment_payee"];
          provider: string | null;
          provider_reference: string | null;
          recorded_by: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          customer_id: string;
          id?: string;
          method: string;
          notes?: string | null;
          order_id: string;
          paid_at?: string | null;
          payee?: Database["public"]["Enums"]["payment_payee"];
          provider?: string | null;
          provider_reference?: string | null;
          recorded_by?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          customer_id?: string;
          id?: string;
          method?: string;
          notes?: string | null;
          order_id?: string;
          paid_at?: string | null;
          payee?: Database["public"]["Enums"]["payment_payee"];
          provider?: string | null;
          provider_reference?: string | null;
          recorded_by?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          created_at: string;
          default_pricing_unit: Database["public"]["Enums"]["pricing_unit"];
          description_ar: string | null;
          id: string;
          is_active: boolean;
          key: string;
          kind: Database["public"]["Enums"]["product_kind"];
          name_ar: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          default_pricing_unit: Database["public"]["Enums"]["pricing_unit"];
          description_ar?: string | null;
          id?: string;
          is_active?: boolean;
          key: string;
          kind: Database["public"]["Enums"]["product_kind"];
          name_ar: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_pricing_unit?: Database["public"]["Enums"]["pricing_unit"];
          description_ar?: string | null;
          id?: string;
          is_active?: boolean;
          key?: string;
          kind?: Database["public"]["Enums"]["product_kind"];
          name_ar?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          ai_training_consent: boolean;
          city: string;
          created_at: string;
          data_processing_consent_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean;
          manufacturer_id: string | null;
          marketing_consent: boolean;
          phone: string | null;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          ai_training_consent?: boolean;
          city?: string;
          created_at?: string;
          data_processing_consent_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          manufacturer_id?: string | null;
          marketing_consent?: boolean;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          ai_training_consent?: boolean;
          city?: string;
          created_at?: string;
          data_processing_consent_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          manufacturer_id?: string | null;
          marketing_consent?: boolean;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_manufacturer_fk";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          address_id: string | null;
          city: string;
          created_at: string;
          current_step: number;
          customer_id: string;
          deleted_at: string | null;
          description: string | null;
          district: string | null;
          id: string;
          name: string;
          photo_consent_at: string | null;
          property_type: Database["public"]["Enums"]["property_type"];
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
          work_type: Database["public"]["Enums"]["kitchen_work_type"];
        };
        ComputedFields: never;
        Insert: {
          address_id?: string | null;
          city?: string;
          created_at?: string;
          current_step?: number;
          customer_id: string;
          deleted_at?: string | null;
          description?: string | null;
          district?: string | null;
          id?: string;
          name: string;
          photo_consent_at?: string | null;
          property_type?: Database["public"]["Enums"]["property_type"];
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
          work_type?: Database["public"]["Enums"]["kitchen_work_type"];
        };
        Update: {
          address_id?: string | null;
          city?: string;
          created_at?: string;
          current_step?: number;
          customer_id?: string;
          deleted_at?: string | null;
          description?: string | null;
          district?: string | null;
          id?: string;
          name?: string;
          photo_consent_at?: string | null;
          property_type?: Database["public"]["Enums"]["property_type"];
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
          work_type?: Database["public"]["Enums"]["kitchen_work_type"];
        };
        Relationships: [
          {
            foreignKeyName: "projects_address_id_fkey";
            columns: ["address_id"];
            isOneToOne: false;
            referencedRelation: "customer_addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quotation_items: {
        Row: {
          description: string;
          id: string;
          line_total: number | null;
          pricing_unit: Database["public"]["Enums"]["pricing_unit"];
          quantity: number;
          quotation_id: string;
          sort_order: number;
          unit_price: number;
        };
        ComputedFields: never;
        Insert: {
          description: string;
          id?: string;
          line_total?: never;
          pricing_unit: Database["public"]["Enums"]["pricing_unit"];
          quantity: number;
          quotation_id: string;
          sort_order?: number;
          unit_price: number;
        };
        Update: {
          description?: string;
          id?: string;
          line_total?: never;
          pricing_unit?: Database["public"]["Enums"]["pricing_unit"];
          quantity?: number;
          quotation_id?: string;
          sort_order?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey";
            columns: ["quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
        ];
      };
      quotations: {
        Row: {
          appliances_summary: string | null;
          created_at: string;
          customer_id: string;
          customer_response_note: string | null;
          delivery_fee: number;
          execution_days: number | null;
          id: string;
          installation_fee: number;
          issued_at: string | null;
          issued_by: string | null;
          kitchen_details: string | null;
          manufacturer_id: string;
          materials_summary: string | null;
          measurement_id: string | null;
          order_id: string;
          payment_terms: string | null;
          project_id: string;
          quotation_number: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["quotation_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          valid_until: string | null;
          vat_amount: number;
          vat_rate: number;
          warranty_terms: string | null;
        };
        ComputedFields: never;
        Insert: {
          appliances_summary?: string | null;
          created_at?: string;
          customer_id: string;
          customer_response_note?: string | null;
          delivery_fee?: number;
          execution_days?: number | null;
          id?: string;
          installation_fee?: number;
          issued_at?: string | null;
          issued_by?: string | null;
          kitchen_details?: string | null;
          manufacturer_id: string;
          materials_summary?: string | null;
          measurement_id?: string | null;
          order_id: string;
          payment_terms?: string | null;
          project_id: string;
          quotation_number?: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["quotation_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          valid_until?: string | null;
          vat_amount?: number;
          vat_rate?: number;
          warranty_terms?: string | null;
        };
        Update: {
          appliances_summary?: string | null;
          created_at?: string;
          customer_id?: string;
          customer_response_note?: string | null;
          delivery_fee?: number;
          execution_days?: number | null;
          id?: string;
          installation_fee?: number;
          issued_at?: string | null;
          issued_by?: string | null;
          kitchen_details?: string | null;
          manufacturer_id?: string;
          materials_summary?: string | null;
          measurement_id?: string | null;
          order_id?: string;
          payment_terms?: string | null;
          project_id?: string;
          quotation_number?: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["quotation_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          valid_until?: string | null;
          vat_amount?: number;
          vat_rate?: number;
          warranty_terms?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_measurement_id_fkey";
            columns: ["measurement_id"];
            isOneToOne: false;
            referencedRelation: "room_measurements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      room_images: {
        Row: {
          appointment_id: string | null;
          bucket: string;
          created_at: string;
          height: number | null;
          id: string;
          kind: Database["public"]["Enums"]["image_kind"];
          mime_type: string;
          project_id: string;
          size_bytes: number;
          sort_order: number;
          storage_path: string;
          uploaded_by: string;
          width: number | null;
        };
        ComputedFields: never;
        Insert: {
          appointment_id?: string | null;
          bucket: string;
          created_at?: string;
          height?: number | null;
          id?: string;
          kind?: Database["public"]["Enums"]["image_kind"];
          mime_type: string;
          project_id: string;
          size_bytes: number;
          sort_order?: number;
          storage_path: string;
          uploaded_by: string;
          width?: number | null;
        };
        Update: {
          appointment_id?: string | null;
          bucket?: string;
          created_at?: string;
          height?: number | null;
          id?: string;
          kind?: Database["public"]["Enums"]["image_kind"];
          mime_type?: string;
          project_id?: string;
          size_bytes?: number;
          sort_order?: number;
          storage_path?: string;
          uploaded_by?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "room_images_appointment_fk";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_images_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      room_measurements: {
        Row: {
          appointment_id: string | null;
          ceiling_height_cm: number | null;
          created_at: string;
          doors: NonNullable<Json>;
          electrical_points: NonNullable<Json>;
          gas_points: NonNullable<Json>;
          id: string;
          is_final: boolean;
          kitchen_shape: Database["public"]["Enums"]["kitchen_shape"];
          notes: string | null;
          project_id: string;
          recorded_by: string | null;
          source: Database["public"]["Enums"]["measurement_source"];
          updated_at: string;
          wall_a_cm: number | null;
          wall_b_cm: number | null;
          wall_c_cm: number | null;
          water_points: NonNullable<Json>;
          window_sill_height_cm: number | null;
          windows: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          appointment_id?: string | null;
          ceiling_height_cm?: number | null;
          created_at?: string;
          doors?: NonNullable<Json>;
          electrical_points?: NonNullable<Json>;
          gas_points?: NonNullable<Json>;
          id?: string;
          is_final?: boolean;
          kitchen_shape?: Database["public"]["Enums"]["kitchen_shape"];
          notes?: string | null;
          project_id: string;
          recorded_by?: string | null;
          source?: Database["public"]["Enums"]["measurement_source"];
          updated_at?: string;
          wall_a_cm?: number | null;
          wall_b_cm?: number | null;
          wall_c_cm?: number | null;
          water_points?: NonNullable<Json>;
          window_sill_height_cm?: number | null;
          windows?: NonNullable<Json>;
        };
        Update: {
          appointment_id?: string | null;
          ceiling_height_cm?: number | null;
          created_at?: string;
          doors?: NonNullable<Json>;
          electrical_points?: NonNullable<Json>;
          gas_points?: NonNullable<Json>;
          id?: string;
          is_final?: boolean;
          kitchen_shape?: Database["public"]["Enums"]["kitchen_shape"];
          notes?: string | null;
          project_id?: string;
          recorded_by?: string | null;
          source?: Database["public"]["Enums"]["measurement_source"];
          updated_at?: string;
          wall_a_cm?: number | null;
          wall_b_cm?: number | null;
          wall_c_cm?: number | null;
          water_points?: NonNullable<Json>;
          window_sill_height_cm?: number | null;
          windows?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: "room_measurements_appointment_fk";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_measurements_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_measurements_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      settlements: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          manufacturer_id: string;
          notes: string | null;
          period_end: string;
          period_start: string;
          reference: string | null;
          settled_at: string | null;
          status: Database["public"]["Enums"]["settlement_status"];
          total_commission: number;
          total_order_value: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          manufacturer_id: string;
          notes?: string | null;
          period_end: string;
          period_start: string;
          reference?: string | null;
          settled_at?: string | null;
          status?: Database["public"]["Enums"]["settlement_status"];
          total_commission?: number;
          total_order_value?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          manufacturer_id?: string;
          notes?: string | null;
          period_end?: string;
          period_start?: string;
          reference?: string | null;
          settled_at?: string | null;
          status?: Database["public"]["Enums"]["settlement_status"];
          total_commission?: number;
          total_order_value?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "settlements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "settlements_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
        ];
      };
      technicians: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          manufacturer_id: string | null;
          notes: string | null;
          phone: string;
          profile_id: string | null;
          service_districts: string[];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          manufacturer_id?: string | null;
          notes?: string | null;
          phone: string;
          profile_id?: string | null;
          service_districts?: string[];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          manufacturer_id?: string | null;
          notes?: string | null;
          phone?: string;
          profile_id?: string | null;
          service_districts?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "technicians_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "technicians_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      warranties: {
        Row: {
          created_at: string;
          customer_id: string;
          ends_on: string;
          id: string;
          manufacturer_id: string;
          order_id: string;
          starts_on: string;
          status: Database["public"]["Enums"]["warranty_status"];
          terms: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          customer_id: string;
          ends_on: string;
          id?: string;
          manufacturer_id: string;
          order_id: string;
          starts_on: string;
          status?: Database["public"]["Enums"]["warranty_status"];
          terms: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          ends_on?: string;
          id?: string;
          manufacturer_id?: string;
          order_id?: string;
          starts_on?: string;
          status?: Database["public"]["Enums"]["warranty_status"];
          terms?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "warranties_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warranties_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warranties_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      list_public_manufacturers: {
        Args: Record<PropertyKey, never>;
        Returns: {
          city: string;
          id: string;
          trade_name: string;
        }[];
      };
      log_activity: {
        Args: {
          p_action: string;
          p_entity_id: string;
          p_entity_type: string;
          p_metadata?: Json;
        };
        Returns: undefined;
      };
      respond_to_quotation: {
        Args: {
          p_note?: string;
          p_quotation_id: string;
          p_response: Database["public"]["Enums"]["quotation_status"];
        };
        Returns: {
          appliances_summary: string | null;
          created_at: string;
          customer_id: string;
          customer_response_note: string | null;
          delivery_fee: number;
          execution_days: number | null;
          id: string;
          installation_fee: number;
          issued_at: string | null;
          issued_by: string | null;
          kitchen_details: string | null;
          manufacturer_id: string;
          materials_summary: string | null;
          measurement_id: string | null;
          order_id: string;
          payment_terms: string | null;
          project_id: string;
          quotation_number: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["quotation_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          valid_until: string | null;
          vat_amount: number;
          vat_rate: number;
          warranty_terms: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "quotations";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      app_role:
        | "admin"
        | "customer"
        | "manufacturer"
        | "technician"
        | "support"
        | "accountant";
      appointment_status:
        "new" | "confirmed" | "completed" | "postponed" | "cancelled";
      assignment_status: "pending" | "accepted" | "declined" | "cancelled";
      commission_status: "pending" | "invoiced" | "settled" | "cancelled";
      complaint_kind: "inquiry" | "complaint" | "warranty_claim";
      complaint_status: "open" | "in_progress" | "resolved" | "closed";
      design_status: "draft" | "generating" | "ready" | "failed";
      generation_status: "pending" | "succeeded" | "failed" | "not_configured";
      image_kind: "room" | "inspection";
      invoice_status: "draft" | "issued" | "paid" | "void";
      kitchen_shape: "straight" | "l_shape" | "u_shape" | "island" | "parallel";
      kitchen_work_type: "new" | "renovation";
      material_kind: "cabinet" | "countertop" | "handle" | "other";
      measurement_source: "customer" | "technician";
      option_category: "style" | "color" | "addon";
      order_status:
        | "new"
        | "design_ready"
        | "awaiting_inspection"
        | "inspected"
        | "awaiting_quotation"
        | "quotation_ready"
        | "awaiting_customer_approval"
        | "awaiting_payment"
        | "paid"
        | "in_manufacturing"
        | "ready_for_installation"
        | "installing"
        | "installed"
        | "completed"
        | "cancelled"
        | "disputed";
      partnership_status: "prospect" | "active" | "paused" | "terminated";
      payment_payee: "manufacturer" | "platform";
      payment_status:
        "pending" | "succeeded" | "failed" | "refunded" | "cancelled";
      price_item_type:
        "material" | "product" | "appliance" | "option" | "service";
      pricing_unit:
        | "linear_meter"
        | "square_meter"
        | "unit"
        | "fixed"
        | "appliance"
        | "installation"
        | "extra";
      product_kind:
        | "base_cabinet"
        | "wall_cabinet"
        | "tall_unit"
        | "corner_unit"
        | "island"
        | "accessory"
        | "service";
      project_status:
        "draft" | "designing" | "design_ready" | "submitted" | "archived";
      property_type: "villa" | "apartment" | "duplex" | "floor" | "other";
      quotation_status:
        | "draft"
        | "issued"
        | "accepted"
        | "rejected"
        | "revision_requested"
        | "expired"
        | "superseded";
      settlement_status: "open" | "invoiced" | "settled" | "cancelled";
      warranty_status: "active" | "expired" | "void";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "customer",
        "manufacturer",
        "technician",
        "support",
        "accountant",
      ],
      appointment_status: [
        "new",
        "confirmed",
        "completed",
        "postponed",
        "cancelled",
      ],
      assignment_status: ["pending", "accepted", "declined", "cancelled"],
      commission_status: ["pending", "invoiced", "settled", "cancelled"],
      complaint_kind: ["inquiry", "complaint", "warranty_claim"],
      complaint_status: ["open", "in_progress", "resolved", "closed"],
      design_status: ["draft", "generating", "ready", "failed"],
      generation_status: ["pending", "succeeded", "failed", "not_configured"],
      image_kind: ["room", "inspection"],
      invoice_status: ["draft", "issued", "paid", "void"],
      kitchen_shape: ["straight", "l_shape", "u_shape", "island", "parallel"],
      kitchen_work_type: ["new", "renovation"],
      material_kind: ["cabinet", "countertop", "handle", "other"],
      measurement_source: ["customer", "technician"],
      option_category: ["style", "color", "addon"],
      order_status: [
        "new",
        "design_ready",
        "awaiting_inspection",
        "inspected",
        "awaiting_quotation",
        "quotation_ready",
        "awaiting_customer_approval",
        "awaiting_payment",
        "paid",
        "in_manufacturing",
        "ready_for_installation",
        "installing",
        "installed",
        "completed",
        "cancelled",
        "disputed",
      ],
      partnership_status: ["prospect", "active", "paused", "terminated"],
      payment_payee: ["manufacturer", "platform"],
      payment_status: [
        "pending",
        "succeeded",
        "failed",
        "refunded",
        "cancelled",
      ],
      price_item_type: [
        "material",
        "product",
        "appliance",
        "option",
        "service",
      ],
      pricing_unit: [
        "linear_meter",
        "square_meter",
        "unit",
        "fixed",
        "appliance",
        "installation",
        "extra",
      ],
      product_kind: [
        "base_cabinet",
        "wall_cabinet",
        "tall_unit",
        "corner_unit",
        "island",
        "accessory",
        "service",
      ],
      project_status: [
        "draft",
        "designing",
        "design_ready",
        "submitted",
        "archived",
      ],
      property_type: ["villa", "apartment", "duplex", "floor", "other"],
      quotation_status: [
        "draft",
        "issued",
        "accepted",
        "rejected",
        "revision_requested",
        "expired",
        "superseded",
      ],
      settlement_status: ["open", "invoiced", "settled", "cancelled"],
      warranty_status: ["active", "expired", "void"],
    },
  },
} as const;
