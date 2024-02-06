import { GLOBAL_URL } from "../config"
import { UsercardUser } from "./UserCard"

export function UserList(arr) {
  const userList = document.createElement("div")
  userList.className = "user-list"

  const hr = document.createElement("hr")

  userList.appendChild(hr)

  for (let i = 0; i < arr.length; i++) {
    // const userCard = UserCard(arr[i])
    const userCard = new UsercardUser(arr[i])
    userList.appendChild(userCard.Create())
  }
  // CONTAINER.appendChild(userList)
  return userList
}

fetch(GLOBAL_URL + "/api/v1/jwt/users", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Request-Method": "GET",
  },
  credentials: "include",
})
  .then((response) => {
    // if (!response.ok) {
    //   if (response.status === 401) {
    //     errorMsg.innerHTML = "No Data"
    //   }
    //   throw new Error("Network response was not ok")
    // }
    return response.json()
  })
  .then((data) => {
    UserList(data.data)
  })
  .catch((error) => {
    // Handle fetch errors
    console.log("Fetch error:", error)
  })
