export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          modified_at: string;
          user_id: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          modified_at?: string;
          user_id: string;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          modified_at?: string;
          user_id?: string;
          parent_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "folders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      files: {
        Row: {
          id: string;
          name: string;
          type: string;
          size: number;
          key: string;
          url: string | null;
          created_at: string;
          modified_at: string;
          user_id: string;
          folder_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          size: number;
          key: string;
          url?: string | null;
          created_at?: string;
          modified_at?: string;
          user_id: string;
          folder_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          size?: number;
          key?: string;
          url?: string | null;
          created_at?: string;
          modified_at?: string;
          user_id?: string;
          folder_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "files_folder_id_fkey";
            columns: ["folder_id"];
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "files_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
