
import type { Production } from "../../models/production"
import { deleteProduction } from "../../services/production-delete"

const productionList = document.querySelector("#production-list")

export function showProductions(
  productions: Production[],
  refreshProductions: () => Promise<void>
) {
  if (productionList) {
    productionList.innerHTML = ""

    productions.forEach((production) => {
      // Cria o card da produção
      const article = document.createElement("article")
      article.classList.add("list-item")

      // Cria o ícone
      const itemIcon = document.createElement("div")
      itemIcon.classList.add("item-icon", "icon-purple")

      const icon = document.createElement("i")
      icon.classList.add("ti", "ti-cake")

      itemIcon.append(icon)

      // Cria o conteúdo do card
      const itemContent = document.createElement("div")
      itemContent.classList.add("item-content")

      // Nome do produto
      const productName = document.createElement("strong")
      productName.textContent = production.product

      // Quantidade
      const productQuantity = document.createElement("span")
      productQuantity.textContent = `${production.quantity} unidades`

      // Horário de preparo
      const preparationTime = document.createElement("span")
      preparationTime.textContent = `Horário: ${production.preparationTime}`

      // Nome do cliente
      const clientName = document.createElement("span")
      clientName.textContent = `Cliente: ${production.client}`

      // Organiza as informações dentro do card
      itemContent.append(
        productName,
        productQuantity,
        preparationTime,
        clientName
      )

      // Cria o botão de exclusão
      const deleteButton = document.createElement("button")
      deleteButton.type = "button"
      deleteButton.classList.add("btn", "btn-outline")
      deleteButton.textContent = "Excluir"

      // Evento de exclusão
      deleteButton.addEventListener("click", async () => {
        const shouldDelete = window.confirm(
          `Deseja realmente excluir "${production.product}"?`
        )

        if (!shouldDelete) {
          return
        }

        // Tenta excluir a produção na API
        try {
          await deleteProduction(production.id)

          console.log("Produção excluída com sucesso!")
        } catch (error) {
          console.error("Erro ao excluir produção:", error)
          return
        }

        // Tenta atualizar a lista após a exclusão
        try {
          await refreshProductions()
        } catch (error) {
          console.error(
            "Produção excluída, mas não foi possível atualizar a lista:",
            error
          )
        }
      })

      // Monta o card completo
      article.append(itemIcon, itemContent, deleteButton)

      // Insere o card na lista
      productionList.append(article)
    })
  }
}
