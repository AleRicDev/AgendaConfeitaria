
import type {
  Production,
  ProductionStatus
} from "../../models/production"

import { deleteProduction } from "../../services/production-delete"
import { updateProductionStatus } from "../../services/production-status"

import { openEditProductionModal } from "./modal"

type DayPeriod = "morning" | "afternoon" | "night"

// Períodos da agenda
const morningList =
  document.querySelector<HTMLDivElement>("#morning-list")

const afternoonList =
  document.querySelector<HTMLDivElement>("#afternoon-list")

const nightList =
  document.querySelector<HTMLDivElement>("#night-list")

// Opções permitidas para o status
const statusOptions: ProductionStatus[] = [
  "Pendente",
  "Em produção",
  "Concluída"
]

// Identifica o período pelo horário
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

// Cria o cartão de uma encomenda
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
  deliveryTime.textContent =
    `Entrega: ${production.deliveryTime}`

  // Itens da encomenda
  const itemsList = document.createElement("div")
  itemsList.classList.add("production-items-list")

  production.items.forEach((item) => {
    const itemText = document.createElement("span")

    itemText.textContent =
      `${item.name} - ${item.quantity} unidade(s)`

    itemsList.append(itemText)
  })

  // Valor total
  const totalValue = document.createElement("span")

  totalValue.textContent =
    `Valor: ${production.totalValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })}`

  // Controle de status
  const statusField = document.createElement("div")
  statusField.classList.add("production-status-field")

  const statusLabel = document.createElement("label")
  statusLabel.textContent = "Status: "

  const statusSelect = document.createElement("select")
  statusSelect.id = `production-status-${production.id}`
  statusSelect.classList.add("btn", "btn-outline")

  statusLabel.htmlFor = statusSelect.id

  // Cria as opções do select
  statusOptions.forEach((status) => {
    const option = document.createElement("option")

    option.value = status
    option.textContent = status

    statusSelect.append(option)
  })

  // Define o status atual
  statusSelect.value = production.status

  const statusMessage = document.createElement("p")
  statusMessage.setAttribute("role", "alert")
  statusMessage.hidden = true

  statusField.append(
    statusLabel,
    statusSelect,
    statusMessage
  )

  // Ações do cartão
  const actions = document.createElement("div")
  actions.classList.add("production-actions")

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

  // Evento para alterar o status
  statusSelect.addEventListener("change", async () => {
    const previousStatus = production.status
    const nextStatus = statusSelect.value as ProductionStatus

    if (nextStatus === previousStatus) {
      return
    }

    // Impede ações simultâneas durante o salvamento
    statusSelect.disabled = true
    editButton.disabled = true
    deleteButton.disabled = true
    statusMessage.hidden = true

    try {
      const updatedProduction = await updateProductionStatus(
        production,
        nextStatus
      )

      // Atualiza os dados locais após salvar na API
      production.status = updatedProduction.status
      production.completedAt = updatedProduction.completedAt

    } catch (error) {
      console.error("Erro ao atualizar status:", error)

      // Restaura a seleção anterior
      statusSelect.value = previousStatus

      statusMessage.textContent =
        "Não foi possível alterar o status."

      statusMessage.hidden = false

      statusSelect.disabled = false
      editButton.disabled = false
      deleteButton.disabled = false

      return
    }

    // Atualiza a agenda depois da alteração
    try {
      await refreshProductions()
    } catch (error) {
      console.error(
        "Status atualizado, mas a agenda não foi recarregada:",
        error
      )

      statusMessage.textContent =
        "Status salvo, mas não foi possível atualizar a agenda."

      statusMessage.hidden = false
    } finally {
      statusSelect.disabled = false
      editButton.disabled = false
      deleteButton.disabled = false
    }
  })

  // Monta o cartão
  itemContent.append(
    clientName,
    deliveryTime,
    itemsList,
    totalValue,
    statusField
  )

  article.append(
    itemIcon,
    itemContent,
    actions
  )

  return article
}

// Renderiza um período da agenda
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

  // Filtra e ordena as encomendas
  const dailyProductions = productions
    .filter((production) => {
      return production.deliveryDate === selectedDate
    })
    .sort((a, b) => {
      return a.deliveryTime.localeCompare(b.deliveryTime)
    })

  // Agrupa pelos períodos
  const groupedProductions: Record<DayPeriod, Production[]> = {
    morning: [],
    afternoon: [],
    night: []
  }

  dailyProductions.forEach((production) => {
    const period = getDayPeriod(production.deliveryTime)

    groupedProductions[period].push(production)
  })

  // Exibe os três períodos
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
