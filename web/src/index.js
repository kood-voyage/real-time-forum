import { OpenMessengers } from "./components/Messenger.js"
import { router } from "./router/Router.js"
import { OnlineUsers, RefreshStatus } from "./components/UserCard.js"
import { Notification } from "./helpers/Notifications.js"

export const Page = document.querySelector(".root")

const ROOT = document.querySelector(".root")
const CONTAINER = document.createElement("div")
const USERSCONTAINER = document.createElement("div")

USERSCONTAINER.className = "users-container"
CONTAINER.className = "container"

let Socket

export function initializeWebSocket() {
  Socket = new WebSocket("ws://localhost:8080/jwt/chat")

  // WebSocket event listeners
  Socket.addEventListener("open", (event) => {
    console.log("WebSocket connection opened:", event)
    RefreshStatus()
  })

  Socket.addEventListener("message", (event) => {
    const parsedData = JSON.parse(event.data)
    let onlineUsers = parsedData.online_users
    setTimeout(() => {
      if (onlineUsers != undefined) {
        for (let i = 0; i < OnlineUsers.length; i++) {
          for (let j = 0; j < onlineUsers.length; j++) {
            if (OnlineUsers[i].id == onlineUsers[j]) {
              OnlineUsers[i].online = true
              RefreshStatus()
            }
          }
        }
      }
    }, 200)

    if (parsedData.message == "online" && parsedData.type == "status") {
      //fire a get all function
      for (let i = 0; i < OnlineUsers.length; i++) {
        if (OnlineUsers[i].id == parsedData.from_user) {
          OnlineUsers[i].online = true
        }
      }
    }

    if (parsedData.message == "offline" && parsedData.type == "status") {
      for (let i = 0; i < OnlineUsers.length; i++) {
        if (OnlineUsers[i].id == parsedData.from_user) {
          OnlineUsers[i].online = false
          onlineUsers = onlineUsers.filter(function (item) {
            return item !== OnlineUsers[i].id
          })
        }
      }
    }

    RefreshStatus()
    for (let i = 0; i < OpenMessengers.length; i++) {
      if (
        OpenMessengers[i].userToId == parsedData.from_user &&
        parsedData.type == "chat"
      ) {
        OpenMessengers[i].AppendLine({
          text: parsedData.message,
          class: "left",
        })
      }
    }
    //Add notification
    if (parsedData.type == "chat" && OpenMessengers.length > 0) {
      //check if chat is open or no
      for (let i = 0; i < OpenMessengers.length; i++) {
        if (OpenMessengers[i].userToId == parsedData.from_user) {
        } else {
          const notification = new Notification(
            parsedData.from_user,
            parsedData.message,
            "Created_at"
          )
          notification.Create()
        }
      }
    } else if (parsedData.type == "chat") {
      const notification = new Notification(
        parsedData.from_user,
        parsedData.message,
        "Created_at"
      )
      notification.Create()
    }
  })

  Socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event)
  })

  Socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event)
  })
}

// Call the router initially and on every navigation
window.addEventListener("DOMContentLoaded", async (e) => {
  e.preventDefault()

  await router()
})

export { ROOT, CONTAINER, USERSCONTAINER, Socket }
