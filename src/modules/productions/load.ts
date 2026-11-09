
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

import type { Production } from "../../models/production"

import { productionFetch } from "../../services/production-fetch"
import { showProductions } from "./show"

// ===================================
// CONFIGURAÇÃO DE DATA
// ===================================

dayjs.locale("pt-br")

// ===================================
// ELEMENTOS DA NAVEGAÇÃO
// ===================================

const dateInput =
  document.querySelector<HTMLInputElement>(
    "#agenda-date"
  )

const dateLabel =
  document.querySelector<HTMLParagraphElement>(
    "#agenda-date-label"
  )

const previousDayButton =
  document.querySelector<HTMLButtonElement>(
    "#previous-day-button"
  )

const nextDayButton =
  document.querySelector<HTMLButtonElement>(
    "#next-day-button"
  )

const todayButton =
  document.querySelector<HTMLButtonElement>(
    "#today-button"
  )

// ===================================
// MENSAGENS DA AGENDA
// ===================================

const feedback =
  document.querySelector<HTMLParagraphElement>(
    "#agenda-feedback"
  )

type FeedbackType = "info" | "success" | "error"

// ===================================
// ELEMENTOS DO PROGRESSO
// ===================================

const progressSection =
  document.querySelector<HTMLElement>(
    "#daily-progress"
  )

const progressSummary =
  document.querySelector<HTMLParagraphElement>(
    "#daily-progress-summary"
  )

const progressPercentage =
  document.querySelector<HTMLElement>(
    "#daily-progress-percentage"
  )

const progressTrack =
  document.querySelector<HTMLDivElement>(
    "#daily-progress-track"
  )

const progressFill =
  document.querySelector<HTMLDivElement>(
    "#daily-progress-fill"
  )

// ===================================
// DATA SELECIONADA
// ===================================

let selectedDate = dayjs().format("YYYY-MM-DD")

function updateDateDisplay(): void {
  if (dateInput) {
    dateInput.value = selectedDate
  }

  if (dateLabel) {
    const formattedDate = dayjs(selectedDate).format(
      "dddd, D [de] MMMM [de] YYYY"
    )

    dateLabel.textContent =
      formattedDate.charAt(0).toUpperCase() +
      formattedDate.slice(1)
  }
}

// ===================================
// FEEDBACK DA AGENDA
// ===================================

/*
  Esta função pode ser chamada por
  outros módulos, como submit.ts.

  Exemplos:
  - Carregando encomendas...
  - Encomenda salva.
  - Erro ao atualizar a agenda.

  Quando canRetry for true, exibimos
  um botão para buscar novamente,
  sem reenviar o formulário.
*/

export function showAgendaFeedback(
  message: string,
  type: FeedbackType = "info",
  canRetry = false
): void {

  if (!feedback) {
    return
  }

  // Remove a mensagem e eventuais
  // botões da operação anterior.
  feedback.replaceChildren()

  if (message === "") {
    feedback.hidden = true
    return
  }

  feedback.hidden = false
  feedback.dataset.feedbackType = type

  feedback.setAttribute(
    "role",
    type === "error" ? "alert" : "status"
  )

  feedback.setAttribute(
    "aria-live",
    type === "error" ? "assertive" : "polite"
  )

  const messageText = document.createElement("span")
  messageText.textContent = message

  feedback.append(messageText)

  if (!canRetry) {
    return
  }

  // Botão para atualizar somente a agenda.
  // Não cria nem edita encomendas.
  const retryButton = document.createElement("button")

  retryButton.type = "button"
  retryButton.classList.add(
    "btn",
    "btn-outline",
    "agenda-retry-button"
  )

  retryButton.textContent = "Atualizar agenda"

  retryButton.addEventListener("click", () => {
    retryButton.disabled = true

    void loadProductions()
      .then(() => {
        showAgendaFeedback(
          "Agenda atualizada.",
          "success"
        )
      })
      .catch((error) => {
        console.error(
          "Erro ao atualizar novamente a agenda:",
          error
        )

        // Preserva o contexto da falha
        // e oferece uma nova tentativa.
        showAgendaFeedback(
          message,
          type,
          true
        )
      })
  })

  feedback.append(" ", retryButton)
}

// ===================================
// CÁLCULO DO PROGRESSO DIÁRIO
// ===================================

function updateDailyProgress(
  productions: Production[],
  date: string
): void {

  if (
    !progressSection ||
    !progressSummary ||
    !progressPercentage ||
    !progressTrack ||
    !progressFill
  ) {
    return
  }

  // Considera somente encomendas
  // com entrega na data selecionada.
  const dailyProductions = productions.filter(
    (production) => {
      return production.deliveryDate === date
    }
  )

  const total = dailyProductions.length

  const completed = dailyProductions.filter(
    (production) => {
      return production.status === "Concluída"
    }
  ).length

  // ===================================
  // DIA SEM ENCOMENDAS
  // ===================================

  if (total === 0) {

    progressSummary.textContent =
      "0 de 0 encomendas concluídas · " +
      "Nenhuma encomenda neste dia"

    // Um traço indica que o percentual
    // não se aplica a um dia vazio.
    progressPercentage.textContent = "—"

    // A barra permanece vazia.
    progressFill.style.width = "0%"

    progressTrack.setAttribute(
      "aria-valuenow",
      "0"
    )

    progressTrack.setAttribute(
      "aria-valuetext",
      "Nenhuma encomenda neste dia"
    )

    progressSection.hidden = false
    return
  }

  // ===================================
  // DIA COM ENCOMENDAS
  // ===================================

  const percentage = Math.round(
    (completed / total) * 100
  )

  const label =
    total === 1
      ? "encomenda concluída"
      : "encomendas concluídas"

  progressSummary.textContent =
    `${completed} de ${total} ${label}`

  progressPercentage.textContent =
    `${percentage}%`

  // Atualiza a representação visual.
  progressFill.style.width = `${percentage}%`

  // Atualiza os atributos de acessibilidade.
  progressTrack.setAttribute(
    "aria-valuenow",
    String(percentage)
  )

  progressTrack.setAttribute(
    "aria-valuetext",
    `${completed} de ${total} ${label}`
  )

  progressSection.hidden = false
}

// ===================================
// CARREGAMENTO DAS ENCOMENDAS
// ===================================

export async function loadProductions(): Promise<void> {

  updateDateDisplay()

  showAgendaFeedback(
    "Carregando encomendas...",
    "info"
  )

  // Evita mostrar dados antigos do progresso
  // enquanto a nova consulta está acontecendo.
  if (progressSection) {
    progressSection.hidden = true
  }

  // Limpa os cartões da consulta anterior.
  document.querySelector(
    "#morning-list"
  )?.replaceChildren()

  document.querySelector(
    "#afternoon-list"
  )?.replaceChildren()

  document.querySelector(
    "#night-list"
  )?.replaceChildren()

  try {

    const productions = await productionFetch()

    // Renderiza os cartões da data selecionada.
    showProductions(
      productions,
      selectedDate,
      loadProductions
    )

    // Atualiza o progresso a partir dos
    // mesmos dados recebidos da API.
    updateDailyProgress(
      productions,
      selectedDate
    )

    // Oculta a mensagem de carregamento.
    showAgendaFeedback("")

  } catch (error) {

    showAgendaFeedback(
      "Não foi possível carregar as encomendas. " +
      "Verifique a conexão e tente novamente.",
      "error",
      true
    )

    throw error
  }
}

// ===================================
// ALTERAÇÃO DA DATA SELECIONADA
// ===================================

function changeSelectedDate(date: string): void {
  if (!dayjs(date).isValid()) {
    return
  }

  selectedDate = dayjs(date).format(
    "YYYY-MM-DD"
  )

  void loadProductions().catch((error) => {
    console.error(
      "Erro ao atualizar a agenda:",
      error
    )
  })
}

// ===================================
// DIA ANTERIOR
// ===================================

previousDayButton?.addEventListener(
  "click",
  () => {

    const previousDate = dayjs(selectedDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD")

    changeSelectedDate(previousDate)
  }
)

// ===================================
// PRÓXIMO DIA
// ===================================

nextDayButton?.addEventListener(
  "click",
  () => {

    const nextDate = dayjs(selectedDate)
      .add(1, "day")
      .format("YYYY-MM-DD")

    changeSelectedDate(nextDate)
  }
)

// ===================================
// VOLTAR PARA HOJE
// ===================================

todayButton?.addEventListener(
  "click",
  () => {

    changeSelectedDate(
      dayjs().format("YYYY-MM-DD")
    )
  }
)

// ===================================
// SELEÇÃO PELO CALENDÁRIO
// ===================================

dateInput?.addEventListener(
  "change",
  () => {

    if (dateInput.value) {
      changeSelectedDate(dateInput.value)
    }
  }
)
