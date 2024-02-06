import "../styles/auth.css"
import { router } from "../router/Router.js"
import { initializeWebSocket } from "../index.js"
import { ROOT, CONTAINER } from "../index.js"
import { Auth, RenderLoginForm } from "../components/Auth/Login.js"
import { GLOBAL_URL } from '../config.js'

export async function Login() {
  try {
      ROOT.innerHTML = ""
      CONTAINER.innerHTML = ""
      Auth.innerHTML = ""

      const LoginForm = RenderLoginForm()

      Auth.appendChild(LoginForm)
      CONTAINER.appendChild(Auth)
      ROOT.appendChild(CONTAINER)

      const loginForm = document.querySelector(".form")
      loginForm.addEventListener("submit", handleFormSubmit)
  } catch (error) {
    console.error("Error checking user login:", error)
  }
}

async function handleFormSubmit(e) {
  e.preventDefault()
  const errorMsg = document.querySelector(".errorMsg")
  const loginForm = document.querySelector(".form")
  const formData = new FormData(loginForm)
  const formDataObject = {}
  formData.forEach((value, key) => {
    if (key !== "confirm_password") {
      formDataObject[key] = value
    }
  })

  fetch( GLOBAL_URL + "/api/v1/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Method": "POST",
    },
    credentials: "include",
    body: JSON.stringify(formDataObject),
  })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            errorMsg.innerHTML = `Invalid Email/Nickname or password`
          }
          throw new Error("Network response was not ok")
        }
      })
      .then(() => {
        initializeWebSocket()
        window.history.pushState({}, "", "/")
        router()
      })
      .catch((error) => {
        console.log("Fetch error:", error)
      })
}