import type { Production } from "../../models/production"

const productionList = document.querySelector("#production-list")

export function showProductions(productions: Production[]) {
  if (productionList) {
    productionList.innerHTML = ""

    productions.forEach((production) => {
      const article = document.createElement("article")
      article.classList.add("list-item")

      const itemIcon = document.createElement("div")
      itemIcon.classList.add("item-icon", "icon-purple")

      const icon = document.createElement("i")
      icon.classList.add("ti", "ti-cake")

      itemIcon.append(icon)

      const itemContent = document.createElement("div")
      itemContent.classList.add("item-content")

      const productName = document.createElement("strong")
      productName.textContent = production.product

      const productQuantity = document.createElement("span")
      productQuantity.textContent = `${production.quantity} unidades`

      const preparationTime = document.createElement("span")
      preparationTime.textContent = `Horário: ${production.preparationTime}`

      const clientName = document.createElement("span")
      clientName.textContent = `Cliente: ${production.client}`

      itemContent.append(
        productName,
        productQuantity,
        preparationTime,
        clientName
      )

      article.append(itemIcon, itemContent)

      productionList.append(article)
    })
  }
}