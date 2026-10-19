
import type { Production } from "../../models/production"

import { deleteProduction } from "../../services/production-delete"
import { openEditProductionModal } from "./modal"

type DayPeriod = "morning" | "afternoon" | "night"

// Containers do HTML
const morningList =
  document.querySelector<HTMLDivElement>("#morning-list")

const afternoonList =
  document.querySelector<HTMLDivElement>("#afternoon-list")

const nightList =
  document.querySelector<HTMLDivElement>("#night-list")

// Identifica o período pelo horário da entrega
function getDayPeriod(deliveryTime: string): DayPeriod {
  const hour = Number(deliveryTime.split(":")[0])

  if (hour >= 5 && hour < 12) {
    return "morning"
  }

  if (hour >= 12 && hour < 18) {
    return "afternoon"
  }

  return "night"
}

// Cria o card de uma encomenda
function createProductionCard(
  production: Production,
  refreshProductions: () => Promise<void>
): HTMLElement {
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

  const deliveryTime = document.createElement("span")
  deliveryTime.classList.add("production-time")
  deliveryTime.textContent = `Entrega: ${production.deliveryTime}`

  const itemsList = document.createElement("div")
  itemsList.classList.add("production-items-list")

  production.items.forEach((item) => {
    const itemText = document.createElement("span")

    itemText.textContent =
      `${item.name} - ${item.quantity} unidade(s)`

    itemsList.append(itemText)
  })

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
    deliveryTime,
    itemsList,
    totalValue,
    status
  )

  // Ações
  const actions = document.createElement("div")
  actions.classList.add("production-actions")

  const editButton = document.createElement("button")
  editButton.type = "button"
  editButton.classList.add("btn", "btn-outline")
  editButton.textContent = "Editar"

  editButton.addEventListener("click", () => {
    openEditProductionModal(production)
  })

  const deleteButton = document.createElement("button")
  deleteButton.type = "button"
  deleteButton.classList.add("btn", "btn-outline")
  deleteButton.textContent = "Excluir"

  deleteButton.addEventListener("click", async () => {
    const shouldDelete = window.confirm(
      `Deseja excluir a encomenda de ${production.client}?`
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
        "Encomenda excluída, mas a agenda não foi atualizada:",
        error
      )
    }
  })

  actions.append(editButton, deleteButton)

  article.append(
    itemIcon,
    itemContent,
    actions
  )

  return article
}

// Renderiza as encomendas de um período
function renderPeriod(
  productions: Production[],
  container: HTMLDivElement,
  refreshProductions: () => Promise<void>
) {
  container.replaceChildren()

  if (productions.length === 0) {
    const emptyMessage = document.createElement("p")

    emptyMessage.classList.add("agenda-empty")
    emptyMessage.textContent =
      "Nenhuma encomenda neste período."

    container.append(emptyMessage)
    return
  }

  productions.forEach((production) => {
    const card = createProductionCard(
      production,
      refreshProductions
    )

    container.append(card)
  })
}

// Renderiza a agenda da data selecionada
export function showProductions(
  productions: Production[],
  selectedDate: string,
  refreshProductions: () => Promise<void>
) {
  if (!morningList || !afternoonList || !nightList) {
    return
  }

  // Seleciona apenas as encomendas do dia
  const dailyProductions = productions
    .filter((production) => {
      return production.deliveryDate === selectedDate
    })
    .sort((a, b) => {
      return a.deliveryTime.localeCompare(b.deliveryTime)
    })

  // Separa as encomendas por período
  const groupedProductions: Record<DayPeriod, Production[]> = {
    morning: [],
    afternoon: [],
    night: []
  }

  dailyProductions.forEach((production) => {
    const period = getDayPeriod(production.deliveryTime)

    groupedProductions[period].push(production)
  })

  // Atualiza as três seções
  renderPeriod(
    groupedProductions.morning,
    morningList,
    refreshProductions
  )

  renderPeriod(
    groupedProductions.afternoon,
    afternoonList,
    refreshProductions
  )

  renderPeriod(
    groupedProductions.night,
    nightList,
    refreshProductions
  )
}
