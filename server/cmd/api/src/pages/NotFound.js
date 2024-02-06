import "../styles/style.css"
import "../styles/notFound.css"

import { ROOT } from "../index"

export function NotFound() {
  ROOT.innerHTML = ""

  const notFoundContainer = document.createElement("div")
  notFoundContainer.classList.add("not-found")

  const notFoundHeader = document.createElement("p")
  notFoundHeader.classList.add("not-found-header")
  notFoundHeader.textContent = "404"

  const notFoundText = document.createElement("p")
  notFoundText.classList.add("not-found-text")
  notFoundText.textContent = `OOPS! Page Not Found`

  const backButton = document.createElement("a")
  backButton.href = "/"
  const notFoundButton = document.createElement("button")
  notFoundButton.classList.add("not-found-button")
  notFoundButton.textContent = "BACK TO HOMEPAGE"
  backButton.appendChild(notFoundButton)
  notFoundContainer.appendChild(notFoundHeader)
  notFoundContainer.appendChild(notFoundText)
  notFoundContainer.appendChild(backButton)

  ROOT.appendChild(notFoundContainer)
}
