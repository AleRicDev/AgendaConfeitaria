import { apiConfig } from "./api-config"

export async function productionFetch() {
  const response = await fetch(`${apiConfig.baseURL}/productions`)

  const productions = await response.json()

  return productions
}