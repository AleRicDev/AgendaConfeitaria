
import type { ProductionInput } from "../../models/production"
import { createProduction } from "../../services/production-create"
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

  // Esconde uma mensagem de erro anterior
  if (errorMessage) {
    errorMessage.hidden = true
  }

  // Verifica se os elementos do formulário existem
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

  // Monta o objeto com os dados do formulário
  const productionData: ProductionInput = {
    client: clientInput.value,
    product: productInput.value,
    quantity: Number(quantityInput.value),
    preparationTime: preparationTimeInput.value,
    deliveryDate: deliveryDateInput.value,
    notes: notesInput.value,
  }

  // Tenta cadastrar a produção na API
  try {
    const createdProduction = await createProduction(productionData)

    console.log(createdProduction)
  } catch (error) {
    console.error("Erro ao cadastrar produção:", error)

    // Exibe a mensagem de erro no modal
    if (errorMessage) {
      errorMessage.hidden = false
    }

    return
  }

  // Executado após o cadastro bem-sucedido
  productionForm.reset()

  closeProductionModal()

  await loadProductions()
})
