export interface Database {
  public: {
    Tables: {
      libraries: {
        Row: {
          id: string
          name: string
          description: string | null
          is_public: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_public?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          title: string
          url: string
          description: string | null
          tags: string[] | null
          library_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          description?: string | null
          tags?: string[] | null
          library_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          description?: string | null
          tags?: string[] | null
          library_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Library = Database["public"]["Tables"]["libraries"]["Row"]
export type LibraryInsert = Database["public"]["Tables"]["libraries"]["Insert"]
export type Item = Database["public"]["Tables"]["items"]["Row"]
export type ItemInsert = Database["public"]["Tables"]["items"]["Insert"]
