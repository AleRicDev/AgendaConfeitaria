
import type {
  ProductionInput,
  ProductionItem
} from "../../models/production"

import { createProduction } from "../../services/production-create"
import { updateProduction } from "../../services/production-update"

import { closeProductionModal } from "./modal"
import { loadProductions } from "./load"

// Formulário
const productionForm =
  document.querySelector<HTMLFormElement>("#production-form")

// Campos principais
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

// Container dos itens
const itemsContainer =
  document.querySelector<HTMLDivElement>("#production-items")

// Mensagem de erro
const errorMessage =
  document.querySelector<HTMLParagraphElement>(
    "#production-form-error"
  )

productionForm?.addEventListener("submit", async (event) => {
  event.preventDefault()

  if (errorMessage) {
    errorMessage.hidden = true
  }

  if (
    !clientInput ||
    !deliveryDateInput ||
    !deliveryTimeInput ||
    !totalValueInput ||
    !notesInput ||
    !itemsContainer
  ) {
    return
  }

  const mode = productionForm.dataset.mode
  const editingId = productionForm.dataset.editingId

  try {
    // 1. Captura as linhas de produtos
    const itemRows =
      itemsContainer.querySelectorAll<HTMLDivElement>(
        ".production-item-row"
      )

    // 2. Prepara o array de itens
    const items: ProductionItem[] = []

    if (itemRows.length === 0) {
      throw new Error("Adicione pelo menos um produto.")
    }

    // 3. Percorre cada linha do formulário
    itemRows.forEach((row) => {
      const nameInput =
        row.querySelector<HTMLInputElement>(
          ".item-name-input"
        )

      const quantityInput =
        row.querySelector<HTMLInputElement>(
          ".item-quantity-input"
        )

      if (!nameInput || !quantityInput) {
        throw new Error("Campos de produto não encontrados.")
      }

      const name = nameInput.value.trim()
      const quantity = Number(quantityInput.value)

      if (
        name === "" ||
        quantityInput.value.trim() === "" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          "Informe um nome e uma quantidade inteira positiva para cada produto."
        )
      }

      // 4. Adiciona o produto ao array
      items.push({
        name,
        quantity
      })
    })

    const client = clientInput.value.trim()
    const totalValue = Number(totalValueInput.value)

    if (client === "") {
      throw new Error("Informe o nome do cliente.")
    }

    if (
      !deliveryDateInput.value ||
      !deliveryTimeInput.value
    ) {
      throw new Error("Informe a data e o horário de entrega.")
    }

    if (
      totalValueInput.value.trim() === "" ||
      !Number.isFinite(totalValue) ||
      totalValue < 0 ||
      !Number.isInteger(Math.round(totalValue * 10000) / 100)
    ) {
      throw new Error(
        "Informe um valor total válido, com até duas casas decimais."
      )
    }

    // 5. Monta a encomenda
    const productionData: ProductionInput = {
      client,
      items,
      deliveryDate: deliveryDateInput.value,
      deliveryTime: deliveryTimeInput.value,
      totalValue,
      notes: notesInput.value.trim()
    }

    // 6. Decide entre editar e cadastrar
    if (mode === "edit") {
      if (
        !editingId ||
        !Number.isSafeInteger(Number(editingId)) ||
        Number(editingId) <= 0
      ) {
        throw new Error("ID de edição inválido.")
      }

      await updateProduction(
        Number(editingId),
        productionData
      )

    } else if (mode === "create") {
      await createProduction(productionData)

    } else {
      throw new Error("Modo do formulário inválido.")
    }

  } catch (error) {
    console.error("Erro ao salvar encomenda:", error)

    if (errorMessage) {
      errorMessage.textContent =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a encomenda."

      errorMessage.hidden = false
    }

    return
  }

  // 7. Limpa e fecha o formulário
  productionForm.reset()

  delete productionForm.dataset.editingId
  productionForm.dataset.mode = "create"

  closeProductionModal()

  // 8. Atualiza a lista
  try {
    await loadProductions()
  } catch (error) {
    console.error(
      "Encomenda salva, mas não foi possível atualizar a lista:",
      error
    )
  }
})
