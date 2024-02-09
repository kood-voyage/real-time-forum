import { GLOBAL_URL } from "../config"

// Function to check the presence of a cookie and return a boolean indicating whether the user is logged in
export const isLoggedIn = async () => {
  try {
    const response = await fetch(GLOBAL_URL + `/api/v1/auth/checkCookie`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return false
      } else {
        // Handle other non-OK responses if necessary
        return false
      }
    }
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Fetch error:", error)
    throw error // Rethrow the error if needed
  }
}

export const Logout = async () => {
  try {
    const response = await fetch(GLOBAL_URL + `/api/v1/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return false
      } else {
        // Handle other non-OK responses if necessary
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Fetch error:", error)
    throw error // Rethrow the error if needed
  }
}

export const curryGetPosts = (category_id = "") => {
  const time_stamp = new Date().toISOString()
  let index = 0

  return async function GetPosts() {
    const requestData = {
      current_index: index,
      page_open_time_stamp: time_stamp,
      category_id: category_id,
    }
    index++
    try {
      const response = await fetch(GLOBAL_URL + "/api/v1/jwt/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized: User needs to authenticate")
        } else {
          console.error(
            `Non-OK response: ${response.status} - ${response.statusText}`
          )
          // Log additional details if available (e.g., response.json())
        }
        return false
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error("Fetch error:", error)
      throw error // Rethrow the error if needed
    }
  }
}

export async function GetAllUsers() {
  try {
    const response = await fetch(GLOBAL_URL + "/api/v1/jwt/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Method": "GET",
      },
      credentials: "include",
    })

    const result = await response.json()

    return result.data
  } catch (error) {
    console.error("Fetch error:", error)
    throw error // Rethrow the error if needed
  }
}

export function SinglePostRequest(url, method, body = null, headers = {}) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },

    credentials: "include",
  }

  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .catch((error) => {
      console.error("Error during fetch operation:", error)
      throw error
    })
}

export const GetUserInfo = async (user_id) => {
  try {
    const response = await fetch(GLOBAL_URL + `/api/v1/jwt/users/${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized: User needs to authenticate")
      } else {
        console.error(
          `Non-OK response: ${response.status} - ${response.statusText}`
        )
        // Log additional details if available (e.g., response.json())
      }
      return false
    }

    return await response.json()
  } catch (error) {
    console.error("Fetch error:", error)
    throw error // Rethrow the error if needed
  }
}

export const GetCategories = async () => {
  try {
    const response = await fetch(GLOBAL_URL + `/api/v1/jwt/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized: User needs to authenticate")
      } else {
        console.error(
          `Non-OK response: ${response.status} - ${response.statusText}`
        )
        // Log additional details if available (e.g., response.json())
      }
      return false
    }

    const result = await response.json()

    return result.data
  } catch (error) {
    console.error("Fetch error:", error)
    throw error // Rethrow the error if needed
  }
}
