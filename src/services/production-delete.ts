import { apiConfig } from "./api-config"

export async function deleteProduction(id: number): Promise<void> {
  const response = await fetch(
    `${apiConfig.baseURL}/productions/${id}`,
    {
      method: "DELETE",
    }
  )

  if (!response.ok) {
    throw new Error("Não foi possível excluir a produção.")
  }
}