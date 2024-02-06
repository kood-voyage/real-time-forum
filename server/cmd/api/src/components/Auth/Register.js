
function RenderRegisterForm() {
  // Create form element
  const form = document.createElement("form")
  form.type = "submit"
  form.action = "/register"
  form.className = "form"
  form.method = "POST"

  // Create heading
  const heading = document.createElement("h1")
  heading.className = "auth-title"
  heading.textContent = "REGISTER"

  // Create email input
  const emailInput = document.createElement("input")
  emailInput.type = "email"
  emailInput.placeholder = "Email address"
  emailInput.name = "email"
  emailInput.required = true

  // Create username input
  const usernameInput = document.createElement("input")
  usernameInput.type = "text"
  usernameInput.placeholder = "Username"
  usernameInput.name = "username"
  usernameInput.minLength = 3
  usernameInput.required = true

  // Create fullName div
  const fullNameDiv = document.createElement("div")
  fullNameDiv.className = "fullName"

  // Create first name input
  const firstNameInput = document.createElement("input")
  firstNameInput.type = "text"
  firstNameInput.placeholder = "First name"
  firstNameInput.name = "first_name"
  firstNameInput.minLength = 3
  firstNameInput.required = true

  // Create last name input
  const lastNameInput = document.createElement("input")
  lastNameInput.type = "text"
  lastNameInput.placeholder = "Last name"
  lastNameInput.name = "last_name"
  lastNameInput.minLength = 3
  lastNameInput.required = true

  fullNameDiv
    .appendChild(document.createElement("div"))
    .appendChild(firstNameInput)
  fullNameDiv
    .appendChild(document.createElement("div"))
    .appendChild(lastNameInput)

  // Create gender select
  const genderSelect = document.createElement("div")
  genderSelect.innerHTML = `
  <label>GENDER</label>
  <select id="gender" name="gender">
    <option value="male" selected>MALE</option>
    <option value="female">FEMALE</option>
    <option value="diverse">DIVERSE</option>
  </select>
`

  // Create date of birth input
  const dateOfBirthInput = document.createElement("input")
  dateOfBirthInput.type = "date"
  dateOfBirthInput.name = "date_of_birth"
  dateOfBirthInput.required = true

  // Create password input
  const passwordInput = document.createElement("input")
  passwordInput.type = "password"
  passwordInput.name = "password"
  passwordInput.placeholder = "********"
  passwordInput.minLength = 8
  passwordInput.maxLength = 32
  passwordInput.required = true

  // Create confirm password input
  const confirmPasswordInput = document.createElement("input")
  confirmPasswordInput.type = "password"
  confirmPasswordInput.name = "confirm_password"
  confirmPasswordInput.placeholder = "********"
  confirmPasswordInput.minLength = 8
  confirmPasswordInput.maxLength = 32
  confirmPasswordInput.required = true

  // Create error message container
  const errorMsg = document.createElement("div")
  errorMsg.className = "errorMsg"

  // Create submit button
  const submitButton = document.createElement("button")
  submitButton.type = "submit"
  submitButton.textContent = "REGISTER"

  // Create paragraph for sign-in link
  const signInParagraph = document.createElement("p")
  signInParagraph.innerHTML =
    'Already have an account? <a href="/login">sign-in</a>'

  // Append elements to form
  form.appendChild(heading)
  form.appendChild(document.createElement("label")).textContent = "EMAIL"
  form.appendChild(emailInput)
  form.appendChild(document.createElement("label")).textContent = "USERNAME"
  form.appendChild(usernameInput)
  form.appendChild(document.createElement("label")).textContent = "FULL NAME"

  form.appendChild(fullNameDiv)
  form.appendChild(genderSelect)
  form.appendChild(document.createElement("label")).textContent =
    "DATE OF BIRTH"
  form.appendChild(dateOfBirthInput)
  form.appendChild(document.createElement("label")).textContent = "PASSWORD"
  form.appendChild(passwordInput)
  form.appendChild(document.createElement("label")).textContent =
    "CONFIRM PASSWORD"
  form.appendChild(confirmPasswordInput)
  form.appendChild(errorMsg)
  form.appendChild(submitButton)
  form.appendChild(signInParagraph)

  // Append form to Register component
  return form
}

export { RenderRegisterForm }
