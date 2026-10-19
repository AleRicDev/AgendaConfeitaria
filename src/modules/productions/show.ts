
import type { Production } from "../../models/production"

import { deleteProduction } from "../../services/production-delete"
import { openEditProductionModal } from "./modal"

const productionList =
  document.querySelector<HTMLDivElement>("#production-list")

export function showProductions(
  productions: Production[],
  refreshProductions: () => Promise<void>
) {
  if (!productionList) {
    return
  }

  productionList.innerHTML = ""

  productions.forEach((production) => {
    // Card da encomenda
    const article = document.createElement("article")
    article.classList.add("list-item")

    // Ícone
    const itemIcon = document.createElement("div")
    itemIcon.classList.add("item-icon", "icon-purple")

    const icon = document.createElement("i")
    icon.classList.add("ti", "ti-cake")

    itemIcon.append(icon)

    // Conteúdo
    const itemContent = document.createElement("div")
    itemContent.classList.add("item-content")

    const clientName = document.createElement("strong")
    clientName.textContent = production.client

    // Lista de produtos da encomenda
    const itemsList = document.createElement("div")
    itemsList.classList.add("production-items-list")

    production.items.forEach((item) => {
      const itemText = document.createElement("span")

      itemText.textContent =
        `${item.name} - ${item.quantity} unidade(s)`

      itemsList.append(itemText)
    })

    const deliveryTime = document.createElement("span")
    deliveryTime.textContent =
      `Entrega: ${production.deliveryTime}`

    const deliveryDate = document.createElement("span")
    deliveryDate.textContent =
      `Data: ${production.deliveryDate}`

    const totalValue = document.createElement("span")
    totalValue.textContent =
      `Valor: ${production.totalValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}`

    const status = document.createElement("span")
    status.textContent = `Status: ${production.status}`

    itemContent.append(
      clientName,
      itemsList,
      deliveryDate,
      deliveryTime,
      totalValue,
      status
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
        `Deseja realmente excluir a encomenda de ${production.client}?`
      )

      if (!shouldDelete) {
        return
      }

      try {
        await deleteProduction(production.id)
      } catch (error) {
        console.error("Erro ao excluir encomenda:", error)
        return
      }

      try {
        await refreshProductions()
      } catch (error) {
        console.error(
          "Encomenda excluída, mas a lista não foi atualizada:",
          error
        )
      }
    })

    // Montagem do card
    article.append(
      itemIcon,
      itemContent,
      editButton,
      deleteButton
    )

    productionList.append(article)
  })
}
