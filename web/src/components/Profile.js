import AvatarImg from "../assets/img/avatar.svg.png"

const profileContainer = document.createElement("div")
profileContainer.classList.add("profile-container")

function RenderProfile(data) {
  const avatarBlock = document.createElement("div")
  avatarBlock.classList.add("avatarBlock")

  const imgBlock = document.createElement("div")
  imgBlock.classList.add("imgBlock")

  const userAvatar = document.createElement("img")
  userAvatar.classList.add("userAvatar")
  userAvatar.src = AvatarImg
  userAvatar.alt = ""

  imgBlock.appendChild(userAvatar)

  const changeAvatarDiv = document.createElement("div")
  changeAvatarDiv.classList.add("changeAvatarDiv")

  avatarBlock.appendChild(imgBlock)
  avatarBlock.appendChild(changeAvatarDiv)

  // Info Block
  const infoBlock = document.createElement("div")
  infoBlock.classList.add("infoBlock")

  const userTextBlock = document.createElement("div")
  userTextBlock.classList.add("userTextBlock")
  const usetInfo = [
    data.first_name,
    data.last_name,
    data.username,
    data.email,
    data.gender,
    data.date_of_birth,
  ]
  usetInfo.forEach((info) => {
    const nameDiv = document.createElement("div")
    nameDiv.classList.add("name")

    const nameHeading = document.createElement("h2")
    nameHeading.textContent = info

    nameDiv.appendChild(nameHeading)
    userTextBlock.appendChild(nameDiv)
  })

  const emailBlock = document.createElement("div")
  emailBlock.classList.add("emailBlock")

  infoBlock.appendChild(userTextBlock)
  infoBlock.appendChild(emailBlock)

  // Append elements to the profile container
  profileContainer.appendChild(avatarBlock)
  profileContainer.appendChild(infoBlock)

  return profileContainer
}

export { profileContainer, RenderProfile }
