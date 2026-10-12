
import { productionFetch } from "../../services/production-fetch"
import { showProductions } from "./show"

export async function loadProductions() {
  const productions = await productionFetch()

  showProductions(productions, loadProductions)
}
