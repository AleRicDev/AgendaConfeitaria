import type { NewProduction } from "../../models/production"

const productionForm = document.querySelector("#production-form")

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

productionForm?.addEventListener("submit", (event) => {
  event.preventDefault()

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

  const newProduction: NewProduction = {
    client: clientInput.value,
    product: productInput.value,
    quantity: Number(quantityInput.value),
    preparationTime: preparationTimeInput.value,
    deliveryDate: deliveryDateInput.value,
    notes: notesInput.value,
  }

  console.log(newProduction)
})