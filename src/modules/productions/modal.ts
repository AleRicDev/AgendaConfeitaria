const productionModal = document.querySelector("#production-modal")

const newProductionButton = document.querySelector(
  "#new-production-button"
)

const closeModalButton = document.querySelector(
  "#production-modal-close"
)

const cancelModalButton = document.querySelector(
  "#production-modal-cancel"
)

function openProductionModal() {
  productionModal?.classList.add("is-open")
}

function closeProductionModal() {
  productionModal?.classList.remove("is-open")
}

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