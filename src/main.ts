import "./css/index.css"

import { productionFetch } from "./services/production-fetch"
import { showProductions } from "./modules/productions/show"

async function loadProductions() {
  const productions = await productionFetch()

  showProductions(productions)
}

loadProductions()