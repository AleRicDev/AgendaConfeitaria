
import type {
  Production,
  ProductionStatus
} from "../../models/production"

import { deleteProduction } from "../../services/production-delete"
import { updateProductionStatus } from "../../services/production-status"
import { openEditProductionModal } from "./modal"

type DayPeriod = "morning" | "afternoon" | "night"

// Containers dos períodos
const morningList =
  document.querySelector<HTMLDivElement>("#morning-list")

const afternoonList =
  document.querySelector<HTMLDivElement>("#afternoon-list")

const nightList =
  document.querySelector<HTMLDivElement>("#night-list")

const statusOptions: ProductionStatus[] = [
  "Pendente",
  "Em produção",
  "Concluída"
]

// Identifica o período pelo horário de entrega
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
  article.classList.add("list-item", "production-card")

  // ===================================
  // CABEÇALHO
  // ===================================

  const header = document.createElement("div")
  header.classList.add("production-card-header")

  const identity = document.createElement("div")
  identity.classList.add("production-identity")

  const itemIcon = document.createElement("div")
  itemIcon.classList.add("item-icon", "icon-purple")

  const icon = document.createElement("i")
  icon.classList.add("ti", "ti-cake")

  itemIcon.append(icon)

  const clientName = document.createElement("strong")
  clientName.classList.add("production-client")
  clientName.textContent = production.client

  identity.append(itemIcon, clientName)

  const deliveryTime = document.createElement("span")
  deliveryTime.classList.add("production-time")
  deliveryTime.textContent = production.deliveryTime

  header.append(identity, deliveryTime)

  // ===================================
  // PRODUTOS E VALOR
  // ===================================

  const content = document.createElement("div")
  content.classList.add("production-card-content")

  const itemsTitle = document.createElement("p")
  itemsTitle.classList.add("production-section-label")
  itemsTitle.textContent = "Itens da encomenda"

  const itemsList = document.createElement("div")
  itemsList.classList.add("production-items-list")

  production.items.forEach((item) => {
    const itemRow = document.createElement("div")
    itemRow.classList.add("production-item")

    const itemName = document.createElement("span")
    itemName.textContent = item.name

    const itemQuantity = document.createElement("span")
    itemQuantity.textContent = `${item.quantity} un.`

    itemRow.append(itemName, itemQuantity)
    itemsList.append(itemRow)
  })

  const totalValue = document.createElement("p")
  totalValue.classList.add("production-total")

  const formattedValue = production.totalValue.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  )

  totalValue.textContent = `Valor total: ${formattedValue}`

  content.append(
    itemsTitle,
    itemsList,
    totalValue
  )

  // ===================================
  // OBSERVAÇÕES EXPANSÍVEIS
  // ===================================

  const notes = production.notes.trim()

  if (notes !== "") {
    const details = document.createElement("details")
    details.classList.add("production-details")

    const summary = document.createElement("summary")

    const showText = document.createElement("span")
    showText.classList.add("details-show-text")
    showText.textContent = "Ver detalhes"

    const hideText = document.createElement("span")
    hideText.classList.add("details-hide-text")
    hideText.textContent = "Ocultar detalhes"

    summary.append(showText, hideText)

    const notesText = document.createElement("p")
    notesText.textContent = notes

    details.append(summary, notesText)
    content.append(details)
  }

  // ===================================
  // CONTROLE DE STATUS
  // ===================================

  const statusField = document.createElement("div")
  statusField.classList.add("production-status-field")

  const statusLabel = document.createElement("label")
  statusLabel.textContent = "Status"

  const statusSelect = document.createElement("select")
  statusSelect.id = `production-status-${production.id}`
  statusSelect.classList.add("production-status-select")

  statusLabel.htmlFor = statusSelect.id

  statusOptions.forEach((status) => {
    const option = document.createElement("option")

    option.value = status
    option.textContent = status

    statusSelect.append(option)
  })

  statusSelect.value = production.status

  const statusMessage = document.createElement("p")
  statusMessage.classList.add("production-inline-error")
  statusMessage.setAttribute("role", "alert")
  statusMessage.hidden = true

  statusField.append(
    statusLabel,
    statusSelect,
    statusMessage
  )

  // ===================================
  // BOTÕES DO CARTÃO
  // ===================================

  const actions = document.createElement("div")
  actions.classList.add("production-actions")

  const editButton = document.createElement("button")
  editButton.type = "button"
  editButton.classList.add("btn", "btn-outline")
  editButton.textContent = "Editar"

  const deleteButton = document.createElement("button")
  deleteButton.type = "button"
  deleteButton.classList.add("btn", "btn-outline")
  deleteButton.textContent = "Excluir"

  const actionMessage = document.createElement("p")
  actionMessage.classList.add("production-inline-error")
  actionMessage.setAttribute("role", "alert")
  actionMessage.hidden = true

  // Bloqueia ou libera os controles
  function setControlsDisabled(disabled: boolean) {
    statusSelect.disabled = disabled
    editButton.disabled = disabled
    deleteButton.disabled = disabled
  }

  // Editar encomenda
  editButton.addEventListener("click", () => {
    openEditProductionModal(production)
  })

  // Excluir encomenda
  deleteButton.addEventListener("click", async () => {
    const shouldDelete = window.confirm(
      `Deseja excluir a encomenda de ${production.client}?`
    )

    if (!shouldDelete) {
      return
    }

    actionMessage.hidden = true
    setControlsDisabled(true)

    try {
      await deleteProduction(production.id)
    } catch (error) {
      console.error("Erro ao excluir encomenda:", error)

      actionMessage.textContent =
        "Não foi possível excluir a encomenda."
      actionMessage.hidden = false

      setControlsDisabled(false)
      return
    }

    try {
      await refreshProductions()
    } catch (error) {
      console.error(
        "Encomenda excluída, mas a agenda não foi atualizada:",
        error
      )

      actionMessage.textContent =
        "Encomenda excluída. Atualize a página para recarregar a agenda."
      actionMessage.hidden = false
    }
  })

  // ===================================
  // ALTERAÇÃO DE STATUS
  // ===================================

  statusSelect.addEventListener("change", async () => {
    const previousStatus = production.status
    const nextStatus = statusSelect.value as ProductionStatus

    if (nextStatus === previousStatus) {
      return
    }

    statusMessage.hidden = true
    setControlsDisabled(true)

    try {
      const updatedProduction = await updateProductionStatus(
        production,
        nextStatus
      )

      production.status = updatedProduction.status
      production.completedAt = updatedProduction.completedAt

    } catch (error) {
      console.error("Erro ao atualizar status:", error)

      statusSelect.value = previousStatus

      statusMessage.textContent =
        "Não foi possível alterar o status."

      statusMessage.hidden = false
      setControlsDisabled(false)
      return
    }

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
      setControlsDisabled(false)
    }
  })

  // ===================================
  // MONTAGEM FINAL
  // ===================================

  actions.append(editButton, deleteButton)

  const footer = document.createElement("div")
  footer.classList.add("production-card-footer")

  footer.append(statusField, actions)

  article.append(
    header,
    content,
    footer,
    actionMessage
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

  const dailyProductions = productions
    .filter((production) => {
      return production.deliveryDate === selectedDate
    })
    .sort((a, b) => {
      return a.deliveryTime.localeCompare(b.deliveryTime)
    })

  const groupedProductions: Record<DayPeriod, Production[]> = {
    morning: [],
    afternoon: [],
    night: []
  }

  dailyProductions.forEach((production) => {
    const period = getDayPeriod(production.deliveryTime)

    groupedProductions[period].push(production)
  })

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
