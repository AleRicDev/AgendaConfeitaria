import { apiConfig } from "./api-config"
import type {
  Production,
  ProductionInput
} from "../models/production"

export async function createProduction(
  productionData: ProductionInput
): Promise<Production> {

  const response = await fetch(
    `${apiConfig.baseURL}/productions`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(productionData),
    }
  )

  if (!response.ok) {
    throw new Error("Não foi possível cadastrar a produção.")
  }

  const createdProduction = await response.json()

  return createdProduction
}