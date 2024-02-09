// Create Auth component

const Auth = document.createElement('div')
Auth.className = 'auth'

function RenderLoginForm() {
  const form = document.createElement('form')
  form.type = 'submit'
  form.action = '/login'
  form.className = 'form'
  form.method = 'POST'

  // Create heading
  const heading = document.createElement('h1')
  heading.className = 'auth-title'
  heading.textContent = 'SIGN-IN'

  // Create email/nickname input
  const emailInput = document.createElement('input')
  emailInput.type = 'text'
  emailInput.placeholder = 'username / e-mail'
  emailInput.name = 'email'

  // Create password input
  const passwordInput = document.createElement('input')
  passwordInput.type = 'password'
  passwordInput.name = 'password'
  passwordInput.placeholder = '********'

  // Create error message container
  const errorMsg = document.createElement('div')
  errorMsg.className = 'errorMsg'

  // Create submit button
  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.textContent = 'SIGN-IN'

  // Create paragraph for registration link
  const registrationParagraph = document.createElement('p')
  registrationParagraph.innerHTML =
    'Don\'t have an account? <a href="/register">Register</a>'

  // Append elements to form
  form.appendChild(heading)
  form.appendChild(document.createElement('label')).textContent =
    'USERNAME / EMAIL'
  form.appendChild(emailInput)
  form.appendChild(document.createElement('label')).textContent = 'PASSWORD'
  form.appendChild(passwordInput)
  form.appendChild(errorMsg)
  form.appendChild(submitButton)
  form.appendChild(registrationParagraph)

  return form
}

export { Auth, RenderLoginForm }
