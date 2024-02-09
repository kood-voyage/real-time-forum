import { ROOT } from ".."
import { CURRENTUSER } from "../router/Router"
import { GLOBAL_URL } from "../config"
import { Messenger, OpenMessengers } from "./Messenger"
export const OnlineUsers = []
export class UsercardUser {
  constructor({ id, username, image_url }) {
    this.id = id
    this.username = username
    this.image_url = image_url
    this.online = false
    this.userComponent = document.createElement("div")

    OnlineUsers.push(this)
  }

  Create() {
    this.userComponent.className = "user"
    // Create user image
    const userImage = document.createElement("img")
    userImage.src = this.image_url
      ? this.image_url
      : "https://images.nightcafe.studio//assets/profile.png?tr=w-1600,c-at_max"
    userImage.alt = "user-avatar-from-userbar"
    // this.userComponent.style.backgroundColor = "red";
    this.userComponent.classList.add("user-offline")
    const onlineIndicator = document.createElement("div")
    onlineIndicator.classList.add("online-indicator")
    // Create user name
    const userName = document.createElement("p")
    userName.textContent = this.username

    this.userComponent.addEventListener("click", () => {
      //Open new one
      fetch(GLOBAL_URL + `/api/v1/auth/checkCookie`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          if (CURRENTUSER != undefined && CURRENTUSER != data.data) {
            window.location.href = "/"
            return
          }
          const Chats = new Messenger(
            this.id,
            this.username,
            this.image_url,
            ROOT
          )
          Chats.Create()
        })
    })
    // Append elements to the User component
    this.userComponent.appendChild(onlineIndicator)
    this.userComponent.appendChild(userImage)
    this.userComponent.appendChild(userName)

    return this.userComponent
  }
}

export function RefreshStatus() {
  for (let user of OnlineUsers) {
    if (user.online) {
      user.userComponent.classList.remove("user-offline")
      user.userComponent.classList.add("user-online")
    } else {
      user.userComponent.classList.remove("user-online")
      user.userComponent.classList.add("user-offline")
    }
  }
}
