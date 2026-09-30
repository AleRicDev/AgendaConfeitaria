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

  const createdProduction = await response.json()

  return createdProduction
}