
import { apiConfig } from "./api-config"

import type {
  Production,
  ProductionInput
} from "../models/production"

export async function updateProduction(
  id: number,
  productionData: ProductionInput
): Promise<Production> {
  const response = await fetch(
    `${apiConfig.baseURL}/productions/${id}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(productionData),
    }
  )

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a produção.")
  }

  const updatedProduction = await response.json()

  return updatedProduction
}
