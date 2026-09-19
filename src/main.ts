import "./css/index.css"

import { productionFetch } from "./services/production-fetch"

const productionList = document.querySelector("#production-list")

async function loadProductions() {
  const productions = await productionFetch()

  if (productionList) {
    productionList.innerHTML = ""

    productions.forEach((production) => {
      const article = document.createElement("article")
      article.classList.add("list-item")

      const itemContent = document.createElement("div")
      itemContent.classList.add("item-content")

      const productName = document.createElement("strong")
      productName.textContent = production.product

      const productQuantity = document.createElement("span")
      productQuantity.textContent = `${production.quantity} unidades`

      const preparationTime = document.createElement("span")
      preparationTime.textContent = `Horário: ${production.preparationTime}`

      itemContent.append(productName, productQuantity, preparationTime)

      article.append(itemContent)

      productionList.append(article)
    })
  }
}

loadProductions()
