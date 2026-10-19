
import type {
  Production,
  ProductionItem
} from "../../models/production"

// Elementos do modal
const productionModal =
  document.querySelector<HTMLDivElement>("#production-modal")

const newProductionButton =
  document.querySelector<HTMLButtonElement>("#new-production-button")

const closeModalButton =
  document.querySelector<HTMLButtonElement>("#production-modal-close")

const cancelModalButton =
  document.querySelector<HTMLButtonElement>("#production-modal-cancel")

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

// Campos da encomenda
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

// Elementos responsáveis pelos itens
const itemsContainer =
  document.querySelector<HTMLDivElement>("#production-items")

const addItemButton =
  document.querySelector<HTMLButtonElement>("#add-item-button")

let nextItemIndex = 0

// Atualiza os botões de remoção
function updateRemoveButtons() {
  if (!itemsContainer) {
    return
  }

  const rows =
    itemsContainer.querySelectorAll(".production-item-row")

  const removeButtons =
    itemsContainer.querySelectorAll<HTMLButtonElement>(
      ".remove-item-button"
    )

  removeButtons.forEach((button) => {
    button.disabled = rows.length <= 1
  })
}

// Cria uma linha de produto
function createItemRow(item?: ProductionItem): HTMLDivElement {
  const row = document.createElement("div")
  row.classList.add("production-item-row")

  // Campo de nome
  const nameGroup = document.createElement("div")
  nameGroup.classList.add("form-group")

  const nameLabel = document.createElement("label")
  nameLabel.textContent = "Produto"

  const nameInput = document.createElement("input")
  nameInput.type = "text"
  nameInput.classList.add("item-name-input")
  nameInput.required = true

  nameInput.id = `item-name-${nextItemIndex}`
  nameLabel.htmlFor = nameInput.id

  nameInput.value = item?.name ?? ""

  nameGroup.append(nameLabel, nameInput)

  // Campo de quantidade
  const quantityGroup = document.createElement("div")
  quantityGroup.classList.add("form-group")

  const quantityLabel = document.createElement("label")
  quantityLabel.textContent = "Quantidade"

  const quantityInput = document.createElement("input")
  quantityInput.type = "number"
  quantityInput.min = "1"
  quantityInput.step = "1"
  quantityInput.required = true
  quantityInput.classList.add("item-quantity-input")

  quantityInput.id = `item-quantity-${nextItemIndex}`
  quantityLabel.htmlFor = quantityInput.id

  quantityInput.value =
    item ? String(item.quantity) : ""

  quantityGroup.append(quantityLabel, quantityInput)

  // Botão remover
  const removeButton = document.createElement("button")
  removeButton.type = "button"
  removeButton.textContent = "Remover"
  removeButton.classList.add(
    "btn",
    "btn-outline",
    "remove-item-button"
  )

  removeButton.addEventListener("click", () => {
    if (!itemsContainer) {
      return
    }

    const rows =
      itemsContainer.querySelectorAll(".production-item-row")

    if (rows.length <= 1) {
      return
    }

    row.remove()
    updateRemoveButtons()
  })

  // Monta a linha
  row.append(
    nameGroup,
    quantityGroup,
    removeButton
  )

  nextItemIndex++

  return row
}

// Preenche o formulário com as linhas recebidas
function renderItemRows(items: ProductionItem[]) {
  if (!itemsContainer) {
    return
  }

  itemsContainer.replaceChildren()

  if (items.length === 0) {
    itemsContainer.append(createItemRow())
  } else {
    items.forEach((item) => {
      itemsContainer.append(createItemRow(item))
    })
  }

  updateRemoveButtons()
}

// Abre o modal para uma nova encomenda
function openProductionModal() {
  if (!productionForm || !itemsContainer) {
    return
  }

  productionForm.reset()

  productionForm.dataset.mode = "create"
  delete productionForm.dataset.editingId

  renderItemRows([])

  if (modalTitle) {
    modalTitle.textContent = "Nova encomenda"
  }

  if (submitButton) {
    submitButton.textContent = "Salvar encomenda"
  }

  if (errorMessage) {
    errorMessage.hidden = true
  }

  productionModal?.classList.add("is-open")
}

// Abre o modal para editar uma encomenda
export function openEditProductionModal(production: Production) {
  if (
    !productionForm ||
    !itemsContainer ||
    !clientInput ||
    !deliveryDateInput ||
    !deliveryTimeInput ||
    !totalValueInput ||
    !notesInput
  ) {
    return
  }

  productionForm.dataset.mode = "edit"
  productionForm.dataset.editingId = String(production.id)

  clientInput.value = production.client
  deliveryDateInput.value = production.deliveryDate
  deliveryTimeInput.value = production.deliveryTime
  totalValueInput.value = String(production.totalValue)
  notesInput.value = production.notes

  renderItemRows(production.items)

  if (modalTitle) {
    modalTitle.textContent = "Editar encomenda"
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

addItemButton?.addEventListener("click", () => {
  if (!itemsContainer) {
    return
  }

  itemsContainer.append(createItemRow())

  updateRemoveButtons()
})
