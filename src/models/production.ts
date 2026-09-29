export interface Production {
  id: number
  client: string
  product: string
  quantity: number
  preparationTime: string
  deliveryDate: string
  notes: string
}

export type NewProduction = Omit<Production, "id">