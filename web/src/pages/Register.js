import { Auth } from '../components/Auth/Login.js'
import { isLoggedIn } from '../helpers/ServerRequests.js'
import { router } from '../router/Router.js'

import { RenderRegisterForm } from '../components/Auth/Register.js'
import { CONTAINER, ROOT } from '../index.js'
import { GLOBAL_URL } from '../config.js'

export async function Register() {
  try {
    const isUserLogged = await isLoggedIn()

    if (isUserLogged) {
      window.location.href = '/'
      router()
    } else {
      CONTAINER.innerHTML = ''
      Auth.innerHTML = ''
      const RegisterForm = RenderRegisterForm()

      Auth.appendChild(RegisterForm)
      CONTAINER.appendChild(Auth)
      ROOT.appendChild(CONTAINER)

      const errorMsg = document.querySelector('.errorMsg')
      const registerForm = document.querySelector('.form')
      registerForm.addEventListener('submit', handleFormSubmit)

      function handleFormSubmit(e) {
        e.preventDefault() // Prevent the default form submission

        const password = document.querySelector('input[name="password"]').value
        const confirm_password = document.querySelector(
          'input[name="confirm_password"]'
        ).value

        if (password !== confirm_password) {
          alert('Passwords do not match')
          return
        }

        // Get form data
        const formData = new FormData(registerForm)

        // Create an object from the form data
        const formDataObject = {}
        formData.forEach((value, key) => {
          // Exclude specific fields (e.g., 'confirm_password')
          if (key !== 'confirm_password') {
            formDataObject[key] = value
          }
        })

        // Log the form data object
        console.log('Form data:', formDataObject)

        // Make a fetch request to the server
        fetch(GLOBAL_URL + '/api/v1/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Method': 'POST'
          },
          body: JSON.stringify(formDataObject)
        })
          .then((response) => {
            if (!response.ok) {
              if (response.status === 422) {
                errorMsg.innerHTML =
                  'User with this email or nickname already exists'
              }
              errorMsg.innerHTML = 'Error occured please try again later'
              throw new Error('Network response was not ok', error)
            }
          })
          .then(() => {
            // Handle the response from the server

            window.location.href = '/login'
            router()
          })
          .catch((error) => {
            // Handle fetch errors
            console.log('Fetch error:', error)
          })
      }
    }
  } catch (error) {
    console.error('Error checking user login:', error)
    // Handle the error as needed
  }
}
