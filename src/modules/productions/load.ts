
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

import { productionFetch } from "../../services/production-fetch"
import { showProductions } from "./show"

// Configura o idioma do Day.js
dayjs.locale("pt-br")

// Elementos da navegação
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

// A agenda inicia na data atual
let selectedDate = dayjs().format("YYYY-MM-DD")

// Atualiza a data exibida
function updateDateDisplay() {
  if (dateInput) {
    dateInput.value = selectedDate
  }

  if (dateLabel) {
    const formattedDate =
      dayjs(selectedDate).format("dddd, D [de] MMMM [de] YYYY")

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

// Busca as encomendas e atualiza a agenda
export async function loadProductions(): Promise<void> {
  updateDateDisplay()

  showFeedback("Carregando encomendas...")

  // Limpa os cartões anteriores durante o carregamento
  document.querySelector("#morning-list")?.replaceChildren()
  document.querySelector("#afternoon-list")?.replaceChildren()
  document.querySelector("#night-list")?.replaceChildren()

  try {
    const productions = await productionFetch()

    showProductions(
      productions,
      selectedDate,
      loadProductions
    )

    showFeedback("")
  } catch (error) {
    showFeedback(
      "Não foi possível carregar as encomendas. Verifique a conexão."
    )

    throw error
  }
}

// Altera a data e recarrega a agenda
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

// Voltar para hoje
todayButton?.addEventListener("click", () => {
  changeSelectedDate(dayjs().format("YYYY-MM-DD"))
})

// Seleção direta pelo calendário
dateInput?.addEventListener("change", () => {
  if (dateInput.value) {
    changeSelectedDate(dateInput.value)
  }
})
