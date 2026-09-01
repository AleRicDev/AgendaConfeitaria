import "./css/index.css"

import { productionFetch } from "./services/production-fetch"

async function loadProductions() {
  const productions = await productionFetch()

}

loadProductions()