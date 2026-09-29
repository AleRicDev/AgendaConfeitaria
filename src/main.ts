import "./css/index.css"
import "./modules/productions/modal"
import "./modules/productions/submit"

import { productionFetch } from "./services/production-fetch"
import { showProductions } from "./modules/productions/show"


async function loadProductions() {
  const productions = await productionFetch()

  showProductions(productions)
}

loadProductions()