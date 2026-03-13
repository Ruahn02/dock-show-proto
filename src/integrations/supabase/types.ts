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
      cargas: {
        Row: {
          chegou: boolean | null
          conferente_id: string | null
          created_at: string
          data: string
          divergencia: string | null
          doca_id: string | null
          fornecedor_id: string
          horario_previsto: string | null
          id: string
          nfs: string[]
          quantidade_veiculos: number | null
          rua: string | null
          solicitacao_id: string | null
          status: string
          tipo_caminhao: string | null
          volume_conferido: number | null
          volume_previsto: number
        }
        Insert: {
          chegou?: boolean | null
          conferente_id?: string | null
          created_at?: string
          data: string
          divergencia?: string | null
          doca_id?: string | null
          fornecedor_id: string
          horario_previsto?: string | null
          id?: string
          nfs?: string[]
          quantidade_veiculos?: number | null
          rua?: string | null
          solicitacao_id?: string | null
          status?: string
          tipo_caminhao?: string | null
          volume_conferido?: number | null
          volume_previsto: number
        }
        Update: {
          chegou?: boolean | null
          conferente_id?: string | null
          created_at?: string
          data?: string
          divergencia?: string | null
          doca_id?: string | null
          fornecedor_id?: string
          horario_previsto?: string | null
          id?: string
          nfs?: string[]
          quantidade_veiculos?: number | null
          rua?: string | null
          solicitacao_id?: string | null
          status?: string
          tipo_caminhao?: string | null
          volume_conferido?: number | null
          volume_previsto?: number
        }
        Relationships: [
          {
            foreignKeyName: "cargas_conferente_id_fkey"
            columns: ["conferente_id"]
            isOneToOne: false
            referencedRelation: "conferentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargas_doca_id_fkey"
            columns: ["doca_id"]
            isOneToOne: false
            referencedRelation: "docas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargas_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      conferentes: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      cross_docking: {
        Row: {
          carga_id: string
          created_at: string
          data: string
          fornecedor_id: string
          id: string
          nfs: string[]
          numero_cross: string | null
          observacao: string | null
          rua: string
          separador_id: string | null
          status: string
          tem_divergencia: boolean | null
          volume_recebido: number
        }
        Insert: {
          carga_id: string
          created_at?: string
          data: string
          fornecedor_id: string
          id?: string
          nfs?: string[]
          numero_cross?: string | null
          observacao?: string | null
          rua: string
          separador_id?: string | null
          status?: string
          tem_divergencia?: boolean | null
          volume_recebido: number
        }
        Update: {
          carga_id?: string
          created_at?: string
          data?: string
          fornecedor_id?: string
          id?: string
          nfs?: string[]
          numero_cross?: string | null
          observacao?: string | null
          rua?: string
          separador_id?: string | null
          status?: string
          tem_divergencia?: boolean | null
          volume_recebido?: number
        }
        Relationships: [
          {
            foreignKeyName: "cross_docking_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_docking_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_docking_separador_id_fkey"
            columns: ["separador_id"]
            isOneToOne: false
            referencedRelation: "conferentes"
            referencedColumns: ["id"]
          },
        ]
      }
      divergencias: {
        Row: {
          carga_id: string
          created_at: string
          cross_id: string | null
          id: string
          origem: string
          produto_codigo: string
          produto_descricao: string
          quantidade: number
          senha_id: string | null
          tipo_divergencia: string
        }
        Insert: {
          carga_id: string
          created_at?: string
          cross_id?: string | null
          id?: string
          origem: string
          produto_codigo: string
          produto_descricao: string
          quantidade: number
          senha_id?: string | null
          tipo_divergencia: string
        }
        Update: {
          carga_id?: string
          created_at?: string
          cross_id?: string | null
          id?: string
          origem?: string
          produto_codigo?: string
          produto_descricao?: string
          quantidade?: number
          senha_id?: string | null
          tipo_divergencia?: string
        }
        Relationships: [
          {
            foreignKeyName: "divergencias_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divergencias_cross_id_fkey"
            columns: ["cross_id"]
            isOneToOne: false
            referencedRelation: "cross_docking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divergencias_senha_id_fkey"
            columns: ["senha_id"]
            isOneToOne: false
            referencedRelation: "senhas"
            referencedColumns: ["id"]
          },
        ]
      }
      docas: {
        Row: {
          carga_id: string | null
          conferente_id: string | null
          created_at: string
          id: string
          numero: number
          rua: string | null
          senha_id: string | null
          status: string
          volume_conferido: number | null
        }
        Insert: {
          carga_id?: string | null
          conferente_id?: string | null
          created_at?: string
          id?: string
          numero: number
          rua?: string | null
          senha_id?: string | null
          status?: string
          volume_conferido?: number | null
        }
        Update: {
          carga_id?: string | null
          conferente_id?: string | null
          created_at?: string
          id?: string
          numero?: number
          rua?: string | null
          senha_id?: string | null
          status?: string
          volume_conferido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "docas_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docas_conferente_id_fkey"
            columns: ["conferente_id"]
            isOneToOne: false
            referencedRelation: "conferentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docas_senha_id_fkey"
            columns: ["senha_id"]
            isOneToOne: false
            referencedRelation: "senhas"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      senhas: {
        Row: {
          carga_id: string | null
          created_at: string
          doca_numero: number | null
          fornecedor_id: string
          hora_chegada: string
          horario_previsto: string | null
          id: string
          liberada: boolean
          local_atual: string
          nome_motorista: string
          numero: number
          rua: string | null
          status: string
          tipo_caminhao: string
          volume_conferido: number | null
        }
        Insert: {
          carga_id?: string | null
          created_at?: string
          doca_numero?: number | null
          fornecedor_id: string
          hora_chegada: string
          horario_previsto?: string | null
          id?: string
          liberada?: boolean
          local_atual?: string
          nome_motorista: string
          numero?: number
          rua?: string | null
          status?: string
          tipo_caminhao: string
          volume_conferido?: number | null
        }
        Update: {
          carga_id?: string | null
          created_at?: string
          doca_numero?: number | null
          fornecedor_id?: string
          hora_chegada?: string
          horario_previsto?: string | null
          id?: string
          liberada?: boolean
          local_atual?: string
          nome_motorista?: string
          numero?: number
          rua?: string | null
          status?: string
          tipo_caminhao?: string
          volume_conferido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "senhas_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "senhas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes: {
        Row: {
          comprador: string | null
          created_at: string
          data_agendada: string | null
          data_solicitacao: string
          email_contato: string
          fornecedor_id: string
          horario_agendado: string | null
          id: string
          nota_fiscal: string | null
          numero_pedido: string | null
          observacoes: string | null
          quantidade_veiculos: number
          status: string
          tipo_caminhao: string
          volume_previsto: number
        }
        Insert: {
          comprador?: string | null
          created_at?: string
          data_agendada?: string | null
          data_solicitacao?: string
          email_contato: string
          fornecedor_id: string
          horario_agendado?: string | null
          id?: string
          nota_fiscal?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          quantidade_veiculos?: number
          status?: string
          tipo_caminhao: string
          volume_previsto: number
        }
        Update: {
          comprador?: string | null
          created_at?: string
          data_agendada?: string | null
          data_solicitacao?: string
          email_contato?: string
          fornecedor_id?: string
          horario_agendado?: string | null
          id?: string
          nota_fiscal?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          quantidade_veiculos?: number
          status?: string
          tipo_caminhao?: string
          volume_previsto?: number
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_carga_operacional: {
        Row: {
          carga_id: string | null
          chegou: boolean | null
          conferente_id: string | null
          data_agendada: string | null
          divergencia: string | null
          doca_conferente_id: string | null
          doca_id: string | null
          doca_numero: number | null
          doca_rua: string | null
          doca_volume_conferido: number | null
          fornecedor_email: string | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          hora_chegada: string | null
          horario_previsto: string | null
          local_atual: string | null
          nome_motorista: string | null
          nota_fiscal: string[] | null
          quantidade_veiculos: number | null
          rua_carga: string | null
          rua_senha: string | null
          senha_doca_numero: number | null
          senha_id: string | null
          senha_liberada: boolean | null
          senha_numero: number | null
          senha_tipo_veiculo: string | null
          solicitacao_id: string | null
          status_carga: string | null
          status_doca: string | null
          status_senha: string | null
          tipo_veiculo: string | null
          volume_conferido: number | null
          volume_previsto: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      rpc_atualizar_fluxo_carga: {
        Args: {
          p_carga_id?: string
          p_conferente_id?: string
          p_divergencia?: string
          p_novo_status?: string
          p_rua?: string
          p_senha_id?: string
          p_volume_conferido?: number
        }
        Returns: undefined
      }
      rpc_finalizar_entrega: {
        Args: { p_carga_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
