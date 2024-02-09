import { ROOT } from '..'
import { Messenger } from '../components/Messenger'
import { GLOBAL_URL } from '../config'
class ArrWithEventListener {
  constructor(arr) {
    this.array = arr
    this.listeners = []
  }

  addListener(callback) {
    this.listeners.push(callback)
  }

  push(item) {
    this.array.unshift(item)
    this.notifyListeners('add', [item])
  }

  notifyListeners(eventName, items) {
    this.listeners.forEach((listener) => {
      listener(eventName, items, this.array)
    })
  }
}

const NotificationArray = new ArrWithEventListener([])
NotificationArray.addListener(() => {
  const notification = document.querySelector('.notification-counter')
  notification.classList.add('show-notification-counter')
  notification.textContent = (parseInt(notification.textContent, 10) || 0) + 1
})
export class Notification {
  constructor(FromUserId, content, createdAt) {
    this.fromUser = FromUserId
    this.content = content
    this.createdAt = createdAt
    this.notification = document.createElement('div')
    this.Root = document.querySelector('.notifications-modal')
    this.fromUserNickname
    this.fromUserImageURL
  }

  async GetUserInformation() {
    //get information about other user
    await fetch(GLOBAL_URL + `/api/v1/jwt/users/` + this.fromUser, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        this.fromUserNickname = data.data.username
        this.fromUserImageURL = data.data.image_url
      })
      .catch((err) => {
        console.log('ERROR WHILE RETRIEVING USER INFORMAITON: ', err)
        return
      })
  }

  async Create() {
    await this.GetUserInformation()
    this.notification.className = 'notification'

    const notficationMsg = document.createElement('p')
    notficationMsg.classList.add('notification-msg')
    notficationMsg.textContent = `:${truncateText(this.content, 15)}`

    const messageAuthor = document.createElement('div')
    messageAuthor.className = 'message-author'
    messageAuthor.textContent = `Fr. ${this.fromUserNickname}`

    this.notification.appendChild(messageAuthor)
    this.notification.appendChild(notficationMsg)

    this.notification.addEventListener('click', () => {
      //open chat
      this.Remove()
      const Chats = new Messenger(
        this.fromUser,
        this.fromUserNickname,
        this.fromUserImageURL,
        ROOT
      )
      Chats.Create()
    })
    NotificationArray.push(this)
    if (this.Root.firstChild) {
      this.Root.insertBefore(this.notification, this.Root.firstChild)
    } else {
      this.Root.appendChild(this.notification)
    }
  }

  Remove() {
    this.Root.removeChild(this.notification)
  }
}

export function ShowNotificationsModal() {
  const modal = document.querySelector('.notifications-modal')
  modal.classList.toggle('show-notifications-modal')
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...'
  } else {
    return text
  }
}
