
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

import type {
  ProductionInput,
  ProductionItem
} from "../../models/production"

import { createProduction } from "../../services/production-create"
import { updateProduction } from "../../services/production-update"

import { closeProductionModal } from "./modal"
import { loadProductions } from "./load"

// Validação de datas
dayjs.extend(customParseFormat)

// Elementos do formulário
const productionForm =
  document.querySelector<HTMLFormElement>("#production-form")

const clientInput =
  document.querySelector<HTMLInputElement>("#client")

const deliveryDateInput =
  document.querySelector<HTMLInputElement>("#delivery-date")

const deliveryTimeInput =
  document.querySelector<HTMLInputElement>("#delivery-time")

const totalValueInput =
  document.querySelector<HTMLInputElement>("#total-value")

const notesInput =
  document.querySelector<HTMLTextAreaElement>("#notes")

const itemsContainer =
  document.querySelector<HTMLDivElement>("#production-items")

const errorMessage =
  document.querySelector<HTMLParagraphElement>(
    "#production-form-error"
  )

const submitButton =
  productionForm?.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  )

let isSaving = false

// Guarda o último valor monetário válido
let lastValidMoneyValue = "0,00"

// Usamos nossas próprias mensagens de validação
if (productionForm) {
  productionForm.noValidate = true
}

// ===================================
// FORMATAÇÃO MONETÁRIA
// ===================================

// Formata um número no padrão brasileiro
function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Converte centavos em texto formatado
function formatCents(cents: number): string {
  return formatMoney(cents / 100)
}

// Converte o texto brasileiro para número
function parseMoney(value: string): number | null {
  const text = value.trim()

  const moneyPattern =
    /^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{2}$/

  if (!moneyPattern.test(text)) {
    return null
  }

  // Exemplo: "1.234,56" -> "123456"
  const digits = text.replace(/\D/g, "")

  const cents = Number(digits)

  if (!Number.isSafeInteger(cents)) {
    return null
  }

  return cents / 100
}

// ===================================
// MÁSCARA MONETÁRIA DINÂMICA
// ===================================

// Seleciona o conteúdo ao entrar no campo
totalValueInput?.addEventListener("focus", () => {
  lastValidMoneyValue = totalValueInput.value

  totalValueInput.select()
})

// Atualiza o valor a cada digitação
totalValueInput?.addEventListener("input", () => {
  // Remove tudo que não for um dígito
  const digits = totalValueInput.value.replace(/\D/g, "")

  // Os dígitos representam centavos
  const cents = Number(digits || "0")

  // Evita números fora do limite seguro
  if (!Number.isSafeInteger(cents)) {
    totalValueInput.value = lastValidMoneyValue
    return
  }

  // Atualiza a apresentação monetária
  const formattedValue = formatCents(cents)

  totalValueInput.value = formattedValue
  lastValidMoneyValue = formattedValue

  // Mantém o cursor ao final do campo
  const cursorPosition = formattedValue.length

  totalValueInput.setSelectionRange(
    cursorPosition,
    cursorPosition
  )
})

// ===================================
// TRATAMENTO DE ERROS
// ===================================

function showFormError(error: unknown): void {
  console.error("Erro ao salvar encomenda:", error)

  if (!errorMessage) {
    return
  }

  errorMessage.textContent =
    error instanceof Error
      ? error.message
      : "Não foi possível salvar a encomenda."

  errorMessage.hidden = false
}

// ===================================
// CAPTURA DOS PRODUTOS
// ===================================

function getProductionItems(): ProductionItem[] {
  if (!itemsContainer) {
    throw new Error(
      "Não foi possível localizar os itens do formulário."
    )
  }

  const itemRows =
    itemsContainer.querySelectorAll<HTMLDivElement>(
      ".production-item-row"
    )

  if (itemRows.length === 0) {
    throw new Error("Adicione pelo menos um produto.")
  }

  const items: ProductionItem[] = []

  itemRows.forEach((row, index) => {
    const nameInput =
      row.querySelector<HTMLInputElement>(
        ".item-name-input"
      )

    const quantityInput =
      row.querySelector<HTMLInputElement>(
        ".item-quantity-input"
      )

    if (!nameInput || !quantityInput) {
      throw new Error(
        "Não foi possível localizar os campos de um produto."
      )
    }

    const name = nameInput.value.trim()
    const quantityText = quantityInput.value.trim()
    const quantity = Number(quantityText)

    if (name === "") {
      throw new Error(
        `Informe o nome do produto ${index + 1}.`
      )
    }

    if (
      quantityText === "" ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `Informe uma quantidade inteira positiva para o produto ${index + 1}.`
      )
    }

    items.push({
      name,
      quantity
    })
  })

  return items
}

// ===================================
// CAPTURA DOS DADOS DA ENCOMENDA
// ===================================

function getProductionData(): ProductionInput {
  if (
    !clientInput ||
    !deliveryDateInput ||
    !deliveryTimeInput ||
    !totalValueInput ||
    !notesInput
  ) {
    throw new Error(
      "Não foi possível localizar os campos do formulário."
    )
  }

  const client = clientInput.value.trim()
  const items = getProductionItems()

  const deliveryDate = deliveryDateInput.value
  const deliveryTime = deliveryTimeInput.value

  const totalValue = parseMoney(totalValueInput.value)

  const notes = notesInput.value.trim()

  // Valida o cliente
  if (client === "") {
    throw new Error("Informe o nome do cliente.")
  }

  // Valida a data
  const validDate = dayjs(
    deliveryDate,
    "YYYY-MM-DD",
    true
  ).isValid()

  if (!validDate) {
    throw new Error("Informe uma data de entrega válida.")
  }

  // Valida o horário
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

  if (!timePattern.test(deliveryTime)) {
    throw new Error("Informe um horário de entrega válido.")
  }

  // Valida o valor monetário
  if (totalValue === null) {
    throw new Error(
      "Informe um valor total válido."
    )
  }

  return {
    client,
    items,
    deliveryDate,
    deliveryTime,
    totalValue,
    notes
  }
}

// ===================================
// ENVIO DO FORMULÁRIO
// ===================================

productionForm?.addEventListener("submit", async (event) => {
  event.preventDefault()

  if (isSaving) {
    return
  }

  if (errorMessage) {
    errorMessage.hidden = true
  }

  try {
    const productionData = getProductionData()

    const mode = productionForm.dataset.mode
    const editingId = productionForm.dataset.editingId

    if (mode !== "create" && mode !== "edit") {
      throw new Error("Modo do formulário inválido.")
    }

    if (
      mode === "edit" &&
      (
        !editingId ||
        !Number.isSafeInteger(Number(editingId)) ||
        Number(editingId) <= 0
      )
    ) {
      throw new Error("ID de edição inválido.")
    }

    // Bloqueia envios simultâneos
    isSaving = true

    const originalButtonText =
      submitButton?.textContent ?? ""

    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = "Salvando..."
    }

    try {
      if (mode === "edit") {
        await updateProduction(
          Number(editingId),
          productionData
        )
      } else {
        await createProduction(productionData)
      }
    } finally {
      isSaving = false

      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText
      }
    }

  } catch (error) {
    showFormError(error)
    return
  }

  // Limpa os dados após salvar
  productionForm.reset()

  delete productionForm.dataset.editingId
  productionForm.dataset.mode = "create"

  closeProductionModal()

  // Atualiza a agenda
  try {
    await loadProductions()
  } catch (error) {
    console.error(
      "Encomenda salva, mas não foi possível atualizar a agenda:",
      error
    )
  }
})

