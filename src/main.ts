
import "./css/index.css"

import "./modules/productions/modal"
import "./modules/productions/submit"

import { loadProductions } from "./modules/productions/load"

void loadProductions().catch((error) => {
  console.error("Erro ao carregar a agenda:", error)
})
