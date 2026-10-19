
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

import type { Production } from "../../models/production"

import { productionFetch } from "../../services/production-fetch"
import { showProductions } from "./show"

// Configura o idioma do Day.js
dayjs.locale("pt-br")

// Elementos de navegação entre datas
const dateInput =
  document.querySelector<HTMLInputElement>("#agenda-date")

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
  document.querySelector<HTMLButtonElement>("#today-button")

const feedback =
  document.querySelector<HTMLParagraphElement>(
    "#agenda-feedback"
  )

// Elementos do progresso diário
const progressSection =
  document.querySelector<HTMLElement>("#daily-progress")

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

// Data inicialmente selecionada
let selectedDate = dayjs().format("YYYY-MM-DD")

// Atualiza a data exibida na interface
function updateDateDisplay() {
  if (dateInput) {
    dateInput.value = selectedDate
  }

  if (dateLabel) {
    const formattedDate =
      dayjs(selectedDate).format(
        "dddd, D [de] MMMM [de] YYYY"
      )

    dateLabel.textContent =
      formattedDate.charAt(0).toUpperCase() +
      formattedDate.slice(1)
  }
}

// Exibe ou oculta mensagens
function showFeedback(message: string) {
  if (!feedback) {
    return
  }

  feedback.textContent = message
  feedback.hidden = message === ""
}

// Calcula e exibe o progresso da data selecionada
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

  // Encomendas previstas para a data selecionada
  const dailyProductions = productions.filter((production) => {
    return production.deliveryDate === date
  })

  // Total de encomendas daquele dia
  const total = dailyProductions.length

  // Quantidade de encomendas concluídas
  const completed = dailyProductions.filter((production) => {
    return production.status === "Concluída"
  }).length

  // Evita divisão por zero quando o dia está vazio
  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100)

  // Atualiza o texto
  progressSummary.textContent =
    `${completed} de ${total} encomendas concluídas`

  progressPercentage.textContent = `${percentage}%`

  // Atualiza a largura da barra
  progressFill.style.width = `${percentage}%`

  // Atualiza as informações de acessibilidade
  progressTrack.setAttribute(
    "aria-valuenow",
    String(percentage)
  )

  progressTrack.setAttribute(
    "aria-valuetext",
    `${completed} de ${total} encomendas concluídas`
  )

  progressSection.hidden = false
}

// Busca as encomendas e atualiza a agenda
export async function loadProductions(): Promise<void> {
  updateDateDisplay()

  showFeedback("Carregando encomendas...")

  // Não mostra progresso antigo enquanto a API carrega
  if (progressSection) {
    progressSection.hidden = true
  }

  // Limpa os cartões da consulta anterior
  document.querySelector("#morning-list")?.replaceChildren()
  document.querySelector("#afternoon-list")?.replaceChildren()
  document.querySelector("#night-list")?.replaceChildren()

  try {
    const productions = await productionFetch()

    // Atualiza as encomendas da agenda
    showProductions(
      productions,
      selectedDate,
      loadProductions
    )

    // Atualiza o progresso usando os mesmos dados
    updateDailyProgress(productions, selectedDate)

    showFeedback("")
  } catch (error) {
    showFeedback(
      "Não foi possível carregar as encomendas. Verifique a conexão."
    )

    throw error
  }
}

// Atualiza a data selecionada
function changeSelectedDate(date: string) {
  if (!dayjs(date).isValid()) {
    return
  }

  selectedDate = dayjs(date).format("YYYY-MM-DD")

  void loadProductions().catch((error) => {
    console.error("Erro ao atualizar a agenda:", error)
  })
}

// Dia anterior
previousDayButton?.addEventListener("click", () => {
  const previousDate = dayjs(selectedDate)
    .subtract(1, "day")
    .format("YYYY-MM-DD")

  changeSelectedDate(previousDate)
})

// Próximo dia
nextDayButton?.addEventListener("click", () => {
  const nextDate = dayjs(selectedDate)
    .add(1, "day")
    .format("YYYY-MM-DD")

  changeSelectedDate(nextDate)
})

// Voltar para a data atual
todayButton?.addEventListener("click", () => {
  changeSelectedDate(dayjs().format("YYYY-MM-DD"))
})

// Seleção direta pelo calendário
dateInput?.addEventListener("change", () => {
  if (dateInput.value) {
    changeSelectedDate(dateInput.value)
  }
})
