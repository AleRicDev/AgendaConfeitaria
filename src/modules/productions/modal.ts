
import type {
  Production,
  ProductionItem
} from "../../models/production"

// ===================================
// ELEMENTOS DO MODAL
// ===================================

const productionModal =
  document.querySelector<HTMLDivElement>(
    "#production-modal"
  )

const modalContent =
  document.querySelector<HTMLDivElement>(
    "#production-modal .modal-content"
  )

const appShell =
  document.querySelector<HTMLElement>(".app-shell")

const newProductionButton =
  document.querySelector<HTMLButtonElement>(
    "#new-production-button"
  )

const closeModalButton =
  document.querySelector<HTMLButtonElement>(
    "#production-modal-close"
  )

const cancelModalButton =
  document.querySelector<HTMLButtonElement>(
    "#production-modal-cancel"
  )

const productionForm =
  document.querySelector<HTMLFormElement>(
    "#production-form"
  )

const modalTitle =
  document.querySelector<HTMLHeadingElement>(
    "#production-modal-title"
  )

const submitButton =
  document.querySelector<HTMLButtonElement>(
    '#production-form button[type="submit"]'
  )

const errorMessage =
  document.querySelector<HTMLParagraphElement>(
    "#production-form-error"
  )

// ===================================
// CAMPOS DA ENCOMENDA
// ===================================

const clientInput =
  document.querySelector<HTMLInputElement>("#client")

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

// ===================================
// CAMPOS DINÂMICOS DE PRODUTOS
// ===================================

const itemsContainer =
  document.querySelector<HTMLDivElement>(
    "#production-items"
  )

const addItemButton =
  document.querySelector<HTMLButtonElement>(
    "#add-item-button"
  )

let nextItemIndex = 0

// Guarda o elemento que estava em foco
// antes da abertura do modal.
let previouslyFocusedElement: HTMLElement | null = null

// Guarda o estilo anterior de rolagem
// para restaurá-lo ao fechar o modal.
let previousBodyOverflow = ""

// ===================================
// FORMATAÇÃO MONETÁRIA
// ===================================

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// ===================================
// CONTROLE DOS BOTÕES REMOVER
// ===================================

function updateRemoveButtons(): void {
  if (!itemsContainer) {
    return
  }

  const rows =
    itemsContainer.querySelectorAll(
      ".production-item-row"
    )

  const removeButtons =
    itemsContainer.querySelectorAll<HTMLButtonElement>(
      ".remove-item-button"
    )

  removeButtons.forEach((button) => {
    button.disabled = rows.length <= 1
  })
}

// ===================================
// CRIAÇÃO DE UMA LINHA DE PRODUTO
// ===================================

function createItemRow(
  item?: ProductionItem
): HTMLDivElement {

  const row = document.createElement("div")
  row.classList.add("production-item-row")

  // CAMPO: NOME DO PRODUTO

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

  // CAMPO: QUANTIDADE

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

  quantityGroup.append(
    quantityLabel,
    quantityInput
  )

  // BOTÃO: REMOVER PRODUTO

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
      itemsContainer.querySelectorAll<HTMLDivElement>(
        ".production-item-row"
      )

    if (rows.length <= 1) {
      return
    }

    // Identifica a posição do produto removido.
    const rowIndex = Array.from(rows).indexOf(row)

    row.remove()
    updateRemoveButtons()

    // Devolve o foco para outro produto.
    const remainingRows =
      itemsContainer.querySelectorAll<HTMLDivElement>(
        ".production-item-row"
      )

    const nextIndex = Math.min(
      rowIndex,
      remainingRows.length - 1
    )

    const nextInput =
      remainingRows[nextIndex]
        ?.querySelector<HTMLInputElement>(
          ".item-name-input"
        )

    nextInput?.focus()
  })

  row.append(
    nameGroup,
    quantityGroup,
    removeButton
  )

  nextItemIndex++

  return row
}

// ===================================
// RENDERIZAÇÃO DOS PRODUTOS
// ===================================

function renderItemRows(
  items: ProductionItem[]
): void {

  if (!itemsContainer) {
    return
  }

  itemsContainer.replaceChildren()

  if (items.length === 0) {
    itemsContainer.append(createItemRow())
  } else {
    items.forEach((item) => {
      itemsContainer.append(
        createItemRow(item)
      )
    })
  }

  updateRemoveButtons()
}

// ===================================
// ABERTURA E FOCO DO MODAL
// ===================================

function showModal(): void {
  if (!productionModal) {
    return
  }

  // Guarda o botão que iniciou a ação.
  previouslyFocusedElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

  previousBodyOverflow =
    document.body.style.overflow

  // Torna o formulário visível.
  productionModal.classList.add("is-open")

  // Impede interação com a agenda ao fundo.
  appShell?.setAttribute("inert", "")

  // Impede rolagem da página atrás do modal.
  document.body.style.overflow = "hidden"

  // O usuário começa diretamente pelo cliente.
  clientInput?.focus()
}

// ===================================
// NOVA ENCOMENDA
// ===================================

function openProductionModal(): void {
  if (!productionForm || !itemsContainer) {
    return
  }

  productionForm.reset()

  productionForm.dataset.mode = "create"
  delete productionForm.dataset.editingId

  renderItemRows([])

  // Novo cadastro começa com R$ 0,00.
  if (totalValueInput) {
    totalValueInput.value = "0,00"
  }

  if (modalTitle) {
    modalTitle.textContent = "Nova encomenda"
  }

  if (submitButton) {
    submitButton.textContent = "Salvar encomenda"
  }

  if (errorMessage) {
    errorMessage.hidden = true
  }

  showModal()
}

// ===================================
// EDITAR ENCOMENDA
// ===================================

export function openEditProductionModal(
  production: Production
): void {

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
  productionForm.dataset.editingId =
    String(production.id)

  clientInput.value = production.client

  deliveryDateInput.value =
    production.deliveryDate

  deliveryTimeInput.value =
    production.deliveryTime

  totalValueInput.value =
    formatMoney(production.totalValue)

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

  showModal()
}

// ===================================
// FECHAR MODAL
// ===================================

export function closeProductionModal(): void {
  if (
    !productionModal ||
    !productionModal.classList.contains("is-open")
  ) {
    return
  }

  // O submit.ts desabilita o botão Salvar
  // enquanto aguarda a resposta da API.
  // Nesse intervalo, não permitimos fechar.
  if (submitButton?.disabled) {
    return
  }

  productionModal.classList.remove("is-open")

  // Reativa a agenda.
  appShell?.removeAttribute("inert")

  // Restaura o comportamento de rolagem.
  document.body.style.overflow =
    previousBodyOverflow

  // Devolve o foco ao elemento anterior,
  // se ele ainda existir na página.
  if (
    previouslyFocusedElement &&
    previouslyFocusedElement.isConnected
  ) {
    previouslyFocusedElement.focus()
  }

  previouslyFocusedElement = null
}

// ===================================
// ELEMENTOS NAVEGÁVEIS DO MODAL
// ===================================

function getFocusableElements(): HTMLElement[] {
  if (!modalContent) {
    return []
  }

  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(", ")

  const elements =
    modalContent.querySelectorAll<HTMLElement>(
      selector
    )

  return Array.from(elements).filter((element) => {
    // Ignora elementos ocultos.
    return element.getClientRects().length > 0
  })
}

// ===================================
// NAVEGAÇÃO POR TECLADO
// ===================================

document.addEventListener("keydown", (event) => {
  if (
    !productionModal?.classList.contains("is-open")
  ) {
    return
  }

  // ESCAPE: fecha o modal.
  if (event.key === "Escape") {
    event.preventDefault()
    closeProductionModal()
    return
  }

  // Só precisamos controlar a tecla Tab.
  if (event.key !== "Tab") {
    return
  }

  const focusableElements =
    getFocusableElements()

  if (focusableElements.length === 0) {
    event.preventDefault()
    return
  }

  const firstElement =
    focusableElements[0]

  const lastElement =
    focusableElements[focusableElements.length - 1]

  const activeElement = document.activeElement

  // Se o foco estiver fora do modal,
  // devolve ao primeiro elemento.
  if (
    !modalContent?.contains(activeElement)
  ) {
    event.preventDefault()
    firstElement.focus()
    return
  }

  // Shift + Tab no primeiro elemento
  // volta para o último.
  if (
    event.shiftKey &&
    activeElement === firstElement
  ) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  // Tab no último elemento
  // retorna ao primeiro.
  if (
    !event.shiftKey &&
    activeElement === lastElement
  ) {
    event.preventDefault()
    firstElement.focus()
  }
})

// ===================================
// EVENTOS DOS BOTÕES
// ===================================

// Nova encomenda
newProductionButton?.addEventListener(
  "click",
  openProductionModal
)

// Fechar
closeModalButton?.addEventListener(
  "click",
  closeProductionModal
)

// Cancelar
cancelModalButton?.addEventListener(
  "click",
  closeProductionModal
)

// Adicionar produto
addItemButton?.addEventListener("click", () => {
  if (!itemsContainer) {
    return
  }

  const newRow = createItemRow()

  itemsContainer.append(newRow)

  updateRemoveButtons()

  // Leva o foco ao produto recém-adicionado.
  const newNameInput =
    newRow.querySelector<HTMLInputElement>(
      ".item-name-input"
    )

  newNameInput?.focus()
})
