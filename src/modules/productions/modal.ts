
import type { Production } from "../../models/production"

const productionModal =
  document.querySelector("#production-modal")

const newProductionButton =
  document.querySelector("#new-production-button")

const closeModalButton =
  document.querySelector("#production-modal-close")

const cancelModalButton =
  document.querySelector("#production-modal-cancel")

const productionForm =
  document.querySelector<HTMLFormElement>("#production-form")

const modalTitle =
  document.querySelector<HTMLHeadingElement>(
    "#production-modal .modal-header h2"
  )

const submitButton =
  document.querySelector<HTMLButtonElement>(
    '#production-form button[type="submit"]'
  )

const errorMessage =
  document.querySelector<HTMLParagraphElement>(
    "#production-form-error"
  )

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

// Abre o modal para cadastrar uma produção
function openProductionModal() {
  if (!productionForm) {
    return
  }

  productionForm.reset()

  // Define que o formulário está criando
  productionForm.dataset.mode = "create"

  // Remove um ID de edição anterior
  delete productionForm.dataset.editingId

  if (modalTitle) {
    modalTitle.textContent = "Nova produção"
  }

  if (submitButton) {
    submitButton.textContent = "Salvar produção"
  }

  if (errorMessage) {
    errorMessage.hidden = true
  }

  productionModal?.classList.add("is-open")
}

// Abre o modal para editar uma produção
export function openEditProductionModal(production: Production) {
  if (
    !productionForm ||
    !clientInput ||
    !productInput ||
    !quantityInput ||
    !preparationTimeInput ||
    !deliveryDateInput ||
    !notesInput
  ) {
    return
  }

  // Define que estamos editando
  productionForm.dataset.mode = "edit"

  // Guarda o ID da produção selecionada
  productionForm.dataset.editingId = String(production.id)

  // Preenche os campos
  clientInput.value = production.client
  productInput.value = production.product
  quantityInput.value = String(production.quantity)
  preparationTimeInput.value = production.preparationTime
  deliveryDateInput.value = production.deliveryDate
  notesInput.value = production.notes

  if (modalTitle) {
    modalTitle.textContent = "Editar produção"
  }

  if (submitButton) {
    submitButton.textContent = "Salvar alterações"
  }

  if (errorMessage) {
    errorMessage.hidden = true
  }

  productionModal?.classList.add("is-open")
}

// Fecha o modal
export function closeProductionModal() {
  productionModal?.classList.remove("is-open")
}

// Eventos
newProductionButton?.addEventListener(
  "click",
  openProductionModal
)

closeModalButton?.addEventListener(
  "click",
  closeProductionModal
)

cancelModalButton?.addEventListener(
  "click",
  closeProductionModal
)
