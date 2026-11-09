
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

import type {
  ProductionInput,
  ProductionItem
} from "../../models/production"

import {
  createProduction
} from "../../services/production-create"

import {
  updateProduction
} from "../../services/production-update"

import {
  closeProductionModal
} from "./modal"

import {
  loadProductions,
  showAgendaFeedback
} from "./load"

// ===================================
// CONFIGURAÇÃO DE DATA
// ===================================

dayjs.extend(customParseFormat)

// ===================================
// ELEMENTOS DO FORMULÁRIO
// ===================================

const productionForm =
  document.querySelector<HTMLFormElement>(
    "#production-form"
  )

const clientInput =
  document.querySelector<HTMLInputElement>(
    "#client"
  )

const deliveryDateInput =
  document.querySelector<HTMLInputElement>(
    "#delivery-date"
  )

const deliveryTimeInput =
  document.querySelector<HTMLInputElement>(
    "#delivery-time"
  )

const totalValueInput =
  document.querySelector<HTMLInputElement>(
    "#total-value"
  )

const notesInput =
  document.querySelector<HTMLTextAreaElement>(
    "#notes"
  )

const itemsContainer =
  document.querySelector<HTMLDivElement>(
    "#production-items"
  )

const errorMessage =
  document.querySelector<HTMLParagraphElement>(
    "#production-form-error"
  )

const submitButton =
  productionForm?.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  )

// ===================================
// CONTROLE DE SALVAMENTO
// ===================================

let isSaving = false

// Último valor monetário válido.
let lastValidMoneyValue = "0,00"

// Utilizamos mensagens de validação próprias.
if (productionForm) {
  productionForm.noValidate = true
}

// ===================================
// FORMATAÇÃO MONETÁRIA
// ===================================

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatCents(cents: number): string {
  return formatMoney(cents / 100)
}

function parseMoney(value: string): number | null {
  const text = value.trim()

  const moneyPattern =
    /^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{2}$/

  if (!moneyPattern.test(text)) {
    return null
  }

  const digits = text.replace(/\D/g, "")
  const cents = Number(digits)

  if (!Number.isSafeInteger(cents)) {
    return null
  }

  return cents / 100
}

// ===================================
// MÁSCARA MONETÁRIA
// ===================================

totalValueInput?.addEventListener(
  "focus",
  () => {

    lastValidMoneyValue =
      totalValueInput.value

    totalValueInput.select()
  }
)

totalValueInput?.addEventListener(
  "input",
  () => {

    const digits =
      totalValueInput.value.replace(/\D/g, "")

    const cents = Number(digits || "0")

    if (!Number.isSafeInteger(cents)) {

      totalValueInput.value =
        lastValidMoneyValue

      return
    }

    const formattedValue =
      formatCents(cents)

    totalValueInput.value =
      formattedValue

    lastValidMoneyValue =
      formattedValue

    const cursorPosition =
      formattedValue.length

    totalValueInput.setSelectionRange(
      cursorPosition,
      cursorPosition
    )
  }
)

// ===================================
// MENSAGENS DE VALIDAÇÃO
// ===================================

function showFormError(error: unknown): void {
  console.error(
    "Erro de validação do formulário:",
    error
  )

  if (!errorMessage) {
    return
  }

  errorMessage.textContent =
    error instanceof Error
      ? error.message
      : "Verifique os dados da encomenda."

  errorMessage.hidden = false
}

// ===================================
// RESULTADO NÃO CONFIRMADO PELA API
// ===================================

function showUnconfirmedSaveError(
  error: unknown
): void {

  console.error(
    "Não foi possível confirmar o salvamento:",
    error
  )

  if (!errorMessage) {
    return
  }

  /*
    Uma falha de comunicação não prova,
    por si só, que o servidor deixou
    de gravar a encomenda.

    Não afirmamos que ela foi salva
    nem que deixou de ser salva.
  */

  errorMessage.textContent =
    "Não foi possível confirmar o resultado " +
    "do salvamento. Seus dados foram mantidos " +
    "no formulário. Verifique a agenda antes " +
    "de tentar novamente, para evitar duplicação."

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
    throw new Error(
      "Adicione pelo menos um produto."
    )
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

    const quantityText =
      quantityInput.value.trim()

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
        "Informe uma quantidade inteira positiva " +
        `para o produto ${index + 1}.`
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

  if (client === "") {
    throw new Error(
      "Informe o nome do cliente."
    )
  }

  const items = getProductionItems()

  const deliveryDate =
    deliveryDateInput.value

  const deliveryTime =
    deliveryTimeInput.value

  const totalValue =
    parseMoney(totalValueInput.value)

  const notes = notesInput.value.trim()

  // DATA DE ENTREGA

  const validDate = dayjs(
    deliveryDate,
    "YYYY-MM-DD",
    true
  ).isValid()

  if (!validDate) {
    throw new Error(
      "Informe uma data de entrega válida."
    )
  }

  // HORÁRIO DE ENTREGA

  const timePattern =
    /^([01]\d|2[0-3]):[0-5]\d$/

  if (!timePattern.test(deliveryTime)) {
    throw new Error(
      "Informe um horário de entrega válido."
    )
  }

  // VALOR TOTAL

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

productionForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault()

    // Impede dois envios simultâneos.
    if (isSaving) {
      return
    }

    if (errorMessage) {
      errorMessage.hidden = true
    }

    // ===================================
    // VALIDAÇÃO ANTES DO ENVIO
    // ===================================

    let productionData: ProductionInput

    try {
      productionData = getProductionData()
    } catch (error) {
      showFormError(error)
      return
    }

    const mode =
      productionForm.dataset.mode

    const editingId = Number(
      productionForm.dataset.editingId
    )

    if (
      mode !== "create" &&
      mode !== "edit"
    ) {
      showFormError(
        new Error(
          "Modo do formulário inválido."
        )
      )

      return
    }

    if (
      mode === "edit" &&
      (
        !Number.isSafeInteger(editingId) ||
        editingId <= 0
      )
    ) {
      showFormError(
        new Error(
          "ID de edição inválido."
        )
      )

      return
    }

    // ===================================
    // PREPARAÇÃO DO SALVAMENTO
    // ===================================

    isSaving = true

    const originalButtonText =
      submitButton?.textContent ??
      "Salvar encomenda"

    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = "Salvando..."
    }

    // ===================================
    // GRAVAÇÃO NA API
    // ===================================

    try {

      if (mode === "edit") {

        await updateProduction(
          editingId,
          productionData
        )

      } else {

        await createProduction(
          productionData
        )

      }

    } catch (error) {

      // O resultado não foi confirmado.
      // Mantemos o modal e os dados.
      showUnconfirmedSaveError(error)

      return

    } finally {

      isSaving = false

      if (submitButton) {
        submitButton.disabled = false

        submitButton.textContent =
          originalButtonText
      }
    }

    // ===================================
    // GRAVAÇÃO CONFIRMADA
    // ===================================

    /*
      Só chegamos aqui quando a chamada
      de criação ou edição retornou
      sem erro.

      O registro foi confirmado pela
      resposta da API.
    */

    const formattedDeliveryDate =
      dayjs(productionData.deliveryDate)
        .format("DD/MM/YYYY")

    // Limpa o estado temporário.
    productionForm.reset()

    delete productionForm.dataset.editingId
    productionForm.dataset.mode = "create"

    // Fecha o modal antes de atualizar a tela.
    closeProductionModal()

    // ===================================
    // ATUALIZAÇÃO DA AGENDA
    // ===================================

    try {

      await loadProductions()

      showAgendaFeedback(
        "Encomenda salva. " +
        `Data de entrega: ${formattedDeliveryDate}.`,
        "success"
      )

    } catch (error) {

      console.error(
        "Encomenda salva, mas a agenda " +
        "não foi atualizada:",
        error
      )

      /*
        A gravação já foi confirmada.

        O botão de atualização fará
        somente uma nova consulta GET,
        sem repetir o cadastro.
      */

      showAgendaFeedback(
        "Encomenda salva para " +
        `${formattedDeliveryDate}, mas não foi ` +
        "possível atualizar a agenda. " +
        "Não cadastre novamente.",
        "error",
        true
      )
    }
  }
)
