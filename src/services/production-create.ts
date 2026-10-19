
import { apiConfig } from "./api-config"

import type {
  Production,
  ProductionInput
} from "../models/production"

export async function createProduction(
  productionData: ProductionInput
): Promise<Production> {

  const newProduction: Omit<Production, "id"> = {
    ...productionData,
    status: "Pendente",
    completedAt: null
  }

  const response = await fetch(
    `${apiConfig.baseURL}/productions`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(newProduction)
    }
  )

  if (!response.ok) {
    throw new Error("Não foi possível cadastrar a encomenda.")
  }

  const createdProduction: Production = await response.json()

  return createdProduction
}
