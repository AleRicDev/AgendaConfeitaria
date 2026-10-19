
import { apiConfig } from "./api-config"

import type {
  Production,
  ProductionStatus
} from "../models/production"

export async function updateProductionStatus(
  production: Production,
  nextStatus: ProductionStatus
): Promise<Production> {

  // Define a data de conclusão
  let completedAt: string | null = null

  if (nextStatus === "Concluída") {
    if (production.status === "Concluída") {
      completedAt = production.completedAt
    } else {
      completedAt = new Date().toISOString()
    }
  }

  // Atualiza apenas status e conclusão
  const response = await fetch(
    `${apiConfig.baseURL}/productions/${production.id}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        status: nextStatus,
        completedAt
      })
    }
  )

  if (!response.ok) {
    throw new Error(
      "Não foi possível atualizar o status da encomenda."
    )
  }

  const updatedProduction: Production = await response.json()

  return updatedProduction
}
