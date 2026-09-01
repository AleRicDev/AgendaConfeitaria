import { apiConfig } from "./api-config"
import type { Production } from "../models/production"

export async function productionFetch(): Promise<Production[]> {
  const response = await fetch(`${apiConfig.baseURL}/productions`)

  const productions = await response.json()

  return productions
}