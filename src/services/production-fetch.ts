
import { apiConfig } from "./api-config"
import type { Production } from "../models/production"

export async function productionFetch(): Promise<Production[]> {
  const response = await fetch(
    `${apiConfig.baseURL}/productions`
  )

  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar as encomendas. Erro HTTP: ${response.status}`
    )
  }

  const productions: Production[] = await response.json()

  return productions
}
