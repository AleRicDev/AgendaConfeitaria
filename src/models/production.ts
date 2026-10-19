
export type ProductionStatus =
  | "Pendente"
  | "Em produção"
  | "Concluída"

export interface ProductionItem {
  name: string
  quantity: number
}

export interface Production {
  id: number
  client: string
  items: ProductionItem[]
  deliveryDate: string
  deliveryTime: string
  totalValue: number
  notes: string
  status: ProductionStatus
  completedAt: string | null
}

export type ProductionInput = Omit<
  Production,
  "id" | "status" | "completedAt"
>
