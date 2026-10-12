
import type { Production } from "../../models/production"

import { deleteProduction } from "../../services/production-delete"
import { openEditProductionModal } from "./modal"

const productionList =
  document.querySelector("#production-list")

export function showProductions(
  productions: Production[],
  refreshProductions: () => Promise<void>
) {
  if (productionList) {
    productionList.innerHTML = ""

    productions.forEach((production) => {
      // Cria o card
      const article = document.createElement("article")
      article.classList.add("list-item")

      // Cria o ícone
      const itemIcon = document.createElement("div")
      itemIcon.classList.add("item-icon", "icon-purple")

      const icon = document.createElement("i")
      icon.classList.add("ti", "ti-cake")

      itemIcon.append(icon)

      // Cria o conteúdo
      const itemContent = document.createElement("div")
      itemContent.classList.add("item-content")

      const productName = document.createElement("strong")
      productName.textContent = production.product

      const productQuantity = document.createElement("span")
      productQuantity.textContent = `${production.quantity} unidades`

      const preparationTime = document.createElement("span")
      preparationTime.textContent = `Horário: ${production.preparationTime}`

      const clientName = document.createElement("span")
      clientName.textContent = `Cliente: ${production.client}`

      itemContent.append(
        productName,
        productQuantity,
        preparationTime,
        clientName
      )

      // Botão Editar
      const editButton = document.createElement("button")
      editButton.type = "button"
      editButton.classList.add("btn", "btn-outline")
      editButton.textContent = "Editar"

      editButton.addEventListener("click", () => {
        openEditProductionModal(production)
      })

      // Botão Excluir
      const deleteButton = document.createElement("button")
      deleteButton.type = "button"
      deleteButton.classList.add("btn", "btn-outline")
      deleteButton.textContent = "Excluir"

      deleteButton.addEventListener("click", async () => {
        const shouldDelete = window.confirm(
          `Deseja realmente excluir "${production.product}"?`
        )

        if (!shouldDelete) {
          return
        }

        try {
          await deleteProduction(production.id)

          console.log("Produção excluída com sucesso!")
        } catch (error) {
          console.error("Erro ao excluir produção:", error)
          return
        }

        try {
          await refreshProductions()
        } catch (error) {
          console.error(
            "Produção excluída, mas não foi possível atualizar a lista:",
            error
          )
        }
      })

      // Monta o card
      article.append(
        itemIcon,
        itemContent,
        editButton,
        deleteButton
      )

      // Adiciona à lista
      productionList.append(article)
    })
  }
}
