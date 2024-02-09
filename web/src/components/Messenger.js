import { Socket } from ".."
import { GLOBAL_URL } from "../config"
import { CURRENTUSER } from "../router/Router"
import chatAvatar from "../assets/img/avatar.svg.png"

import closeImg from "../assets/img/close.svg"
import sendImg from "../assets/img/send.svg"
import { isLoggedIn } from "../helpers/ServerRequests"

export const OpenMessengers = []
export class Messenger {
  constructor(userToId, username, imageUrl, RootElement) {
    this.currentUserId = CURRENTUSER
    this.userToId = userToId
    this.username = username
    this.imageUrl = imageUrl
    this.RootElement = RootElement
    this.chatBody = document.createElement("div")
    this.messenger = document.createElement("div")
    this.messages = []
    this.chatId
    this.openedAt = new Date().toISOString()
    this.chatPage = 0
    this.sendButtonActive = false

    this.chatBody.addEventListener(
      "wheel",
      Throttle(() => this.LoadOlderChats(), 300)
    )
  }

  //Get messages from the back-end

  Close() {
    this.RootElement.removeChild(this.messenger)
    OpenMessengers.pop(this.messenger)
  }

  async LoadChats() {
    await this.GetChatId()
    //Initalize last messages from database (like 20 last messages)
    fetch(GLOBAL_URL + `/api/v1/jwt/chat/line/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: this.chatId,
        timestamp: this.openedAt,
        count: this.chatPage,
      }),
      credentials: "include",
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        if (data.data != null) {
          data.data.forEach((item) => {
            let toBeClass = "left"
            if (item.user_id == this.currentUserId) {
              toBeClass = "right"
            }
            this.messages.push({
              text: item.content,
              class: toBeClass,
              timeStamp: item.timestamp,
            })
          })
        }
        this.AddChats()
        this.chatPage++
      })
      .catch((err) => {
        console.log("ERROR WHILE CREATING CHATID: ", err)
        return
      })
  }

  async GetChatId() {
    ///api/v1/jwt/chat/:user_id
    await fetch(GLOBAL_URL + `/api/v1/jwt/chat/` + this.userToId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        this.chatId = data.data.chat_id[0]
        // return data.data.chat_id[0]
      })
      .catch((err) => {
        console.log("ERROR WHILE CREATING CHATID: ", err)
        return
      })
  }

  async LoadOlderChats() {
    // If scollred up, add more messagesconst
    // await this.GetChatId()
    const isAtTop = this.chatBody.scrollTop <= 400
    if (isAtTop) {
      fetch(GLOBAL_URL + `/api/v1/jwt/chat/line/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          timestamp: this.openedAt,
          count: this.chatPage,
        }),
        credentials: "include",
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          if (data.data != null) {
            data.data.forEach((element) => {
              if (element.user_id == this.currentUserId) {
                this.AppendLine(
                  {
                    text: element.content,
                    class: "right",
                    timeStamp: element.timestamp,
                  },
                  true
                )
              } else {
                this.AppendLine(
                  {
                    text: element.content,
                    class: "left",
                    timeStamp: element.timestamp,
                  },
                  true
                )
              }
            })
            this.chatPage++
          }
        })
    }
  }

  Create() {
    if (OpenMessengers.length > 0) {
      OpenMessengers.forEach((mess) => {
        mess.Close()
      })
    }
    //Create new messenger
    OpenMessengers.push(this)

    this.messenger.classList.add("messenger")

    const chatHeader = document.createElement("div")
    chatHeader.classList.add("chat-header")

    const userChatInfo = document.createElement("div")
    userChatInfo.classList.add("user-chat-info")

    const userImage = document.createElement("img")
    userImage.src = chatAvatar
    userImage.alt = this.userToId

    const userName = document.createElement("p")
    userName.textContent = this.username
    const closeIcon = document.createElement("img")
    closeIcon.src = closeImg
    closeIcon.alt = "close"
    closeIcon.addEventListener("click", () => {
      this.Close()
    })

    userChatInfo.appendChild(userImage)
    userChatInfo.appendChild(userName)

    chatHeader.appendChild(userChatInfo)
    chatHeader.appendChild(closeIcon)

    this.chatBody.classList.add("chat-body")

    this.LoadChats()

    const chatFooter = document.createElement("div")
    chatFooter.className = "chat-footer"

    // Create form for message input
    const messageForm = document.createElement("form")
    //do not allow to send things with enter

    // Create message input
    const messageInput = document.createElement("input")
    messageInput.type = "text"
    messageInput.placeholder = "Aa"
    messageInput.id = "message"

    const sendButton = document.createElement("input")

    // Create send button
    sendButton.type = "image"
    sendButton.src = sendImg
    sendButton.name = "submit"
    sendButton.alt = "submit"
    sendButton.className = "form-img-submit"

    const submitForm = async () => {
      let is = false
      await fetch(GLOBAL_URL + `/api/v1/auth/checkCookie`, {
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
          is = true
        })

      if (is) {
        let messageToSend = {
          message: messageInput.value,
          to_user: this.userToId,
        }
        sendMessage(JSON.stringify(messageToSend))
        let textLine = {
          text: messageInput.value,
          class: "right",
          timeStamp: new Date().toISOString(),
        }
        this.AddToDatabase(messageInput.value)
        this.messages.push(textLine)
        messageInput.value = ""
        this.AppendLine(textLine)
      }
    }
    sendButton.addEventListener("click", async (event) => {
      event.preventDefault()
      if (messageInput.value.trim().length !== 0) {
        await submitForm()
      }
    })

    messageForm.appendChild(messageInput)
    messageForm.appendChild(sendButton)

    chatFooter.appendChild(messageForm)

    this.messenger.appendChild(chatHeader)
    this.messenger.appendChild(this.chatBody)
    this.messenger.appendChild(chatFooter)
    //appendToRoot
    this.RootElement.appendChild(this.messenger)
    //move the chat to bottom
    this.chatBody.scrollTop = this.chatBody.scrollHeight
  }

  AddChats() {
    // const scrollTop = this.chatBody.scrollTop;
    this.chatBody.innerHTML = ""
    this.messages.reverse().forEach((message) => {
      this.AppendLine(message)
    })
  }

  async AddToDatabase(message) {
    await this.GetChatId()
    await fetch(GLOBAL_URL + `/api/v1/jwt/chat/line/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: this.chatId,
        content: message,
        timestamp: new Date().toISOString(),
      }),
      credentials: "include",
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        // return data.data.chat_id[0]
      })
      .catch((err) => {
        console.log("ERROR ADDING LINE TO DATABASE: ", err)
        return
      })
  }

  AppendLine(message, top = false) {
    const msgDiv = document.createElement("div")
    msgDiv.classList.add("msg")

    const msgText = document.createElement("p")
    msgText.classList.add(message.class)
    msgText.textContent = message.text

    msgDiv.addEventListener("mouseover", (event) => {
      let timeValue = formatTimestamp(message.timeStamp)
      event.currentTarget.title = `Sent at ${timeValue}`
    })

    msgDiv.appendChild(msgText)

    if (top) {
      this.chatBody.insertBefore(msgDiv, this.chatBody.firstChild)
    } else {
      this.chatBody.appendChild(msgDiv)
      this.chatBody.scrollTop = this.chatBody.scrollHeight
    }
    // return msgDiv
  }
}

export function Throttle(func, delay) {
  let shouldWait = false

  return function (...args) {
    if (shouldWait) return
    func(...args)
    shouldWait = true

    setTimeout(() => {
      shouldWait = false
    }, delay)
  }
}

// Append the 'messenger' element to the document or any other container element in your HTML
function sendMessage(message) {
  if (Socket.readyState === WebSocket.OPEN) {
    Socket.send(message)
  } else {
    console.error("WebSocket connection not open. Cannot send message.")
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
