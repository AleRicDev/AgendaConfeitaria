
import type { ProductionInput } from "../../models/production"

import { createProduction } from "../../services/production-create"
import { updateProduction } from "../../services/production-update"

import { closeProductionModal } from "./modal"
import { loadProductions } from "./load"

const productionForm =
  document.querySelector<HTMLFormElement>("#production-form")

const clientInput =
  document.querySelector<HTMLInputElement>("#client")

const productInput =
  document.querySelector<HTMLInputElement>("#product")

const quantityInput =
  document.querySelector<HTMLInputElement>("#quantity")

const preparationTimeInput =
  document.querySelector<HTMLInputElement>("#preparation-time")

const deliveryDateInput =
  document.querySelector<HTMLInputElement>("#delivery-date")

const notesInput =
  document.querySelector<HTMLTextAreaElement>("#notes")

const errorMessage =
  document.querySelector<HTMLParagraphElement>("#production-form-error")

productionForm?.addEventListener("submit", async (event) => {
  event.preventDefault()

  if (errorMessage) {
    errorMessage.hidden = true
  }

  // Verifica se os elementos existem
  if (
    !clientInput ||
    !productInput ||
    !quantityInput ||
    !preparationTimeInput ||
    !deliveryDateInput ||
    !notesInput
  ) {
    return
  }

  // Captura os dados do formulário
  const productionData: ProductionInput = {
    client: clientInput.value,
    product: productInput.value,
    quantity: Number(quantityInput.value),
    preparationTime: preparationTimeInput.value,
    deliveryDate: deliveryDateInput.value,
    notes: notesInput.value,
  }

  // Identifica a operação
  const mode = productionForm.dataset.mode
  const editingId = productionForm.dataset.editingId

  try {
    if (mode === "edit") {
      // Garante que uma edição possui um ID válido
      if (
        editingId === undefined ||
        editingId.trim() === "" ||
        !Number.isSafeInteger(Number(editingId))
      ) {
        throw new Error("ID de edição inválido.")
      }

      // Atualiza a produção existente
      const updatedProduction = await updateProduction(
        Number(editingId),
        productionData
      )

      console.log("Produção atualizada:", updatedProduction)

    } else if (mode === "create") {
      // Cadastra uma nova produção
      const createdProduction =
        await createProduction(productionData)

      console.log("Produção criada:", createdProduction)

    } else {
      throw new Error("Modo do formulário inválido.")
    }

  } catch (error) {
    console.error("Erro ao salvar produção:", error)

    if (errorMessage) {
      errorMessage.textContent = mode === "edit"
        ? "Não foi possível atualizar a produção. Tente novamente."
        : "Não foi possível cadastrar a produção. Tente novamente."

      errorMessage.hidden = false
    }

    return
  }

  // Limpa o formulário
  productionForm.reset()

  // Limpa o estado anterior
  delete productionForm.dataset.editingId
  productionForm.dataset.mode = "create"

  // Fecha o modal
  closeProductionModal()

  // Atualiza a lista
  try {
    await loadProductions()
  } catch (error) {
    console.error(
      "Produção salva, mas não foi possível atualizar a lista:",
      error
    )
  }
})
