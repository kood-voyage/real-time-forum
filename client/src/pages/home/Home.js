import { NavbarLogged } from "../../components/Navbar/NavbarLogged.js"
import "../../styles/style.css"
import "../../styles/post.css"
import "../../styles/messenger.css"
import "../../styles/chat.css"
import "../../styles/users.css"
import { RenderPost } from "../../components/Post"
import {
  Messenger,
  OpenMessengers,
  RenderMessenger,
} from "../../components/Messenger"
import {
  GetAllUsers,
  GetPosts,
  SinglePostRequest,
} from "../../helpers/ServerRequests.js"
import { CONTAINER, ROOT, Socket } from "../../index.js"
import { RenderPostFeed } from "../../components/PostFeed.js"
import { RenderFilter } from "../../components/Filter.js"
import { RouterFunction } from "../../router/Router.js"
import { UserList } from "../../components/UserList"

const usersContainer = document.createElement("div")

usersContainer.className = "users-container"

export async function RenderHomePage() {
  ROOT.innerHTML = ""
  CONTAINER.innerHTML = ""

  usersContainer.innerHTML = ""
  await NavbarLogged()

  // const Chats = new Messenger("CURRUSERID", "user2", "USERNAME", "testimageurl", ROOT)
  const PostFeed = RenderPostFeed()
  console.log(Socket)
  ROOT.append(CONTAINER)

  fetchData(PostFeed)

  fetchUsers(usersContainer)

  const Filter = RenderFilter()

  ROOT.appendChild(Filter)
  CONTAINER.appendChild(PostFeed)

  const selectBlock = document.querySelector(".select-block")
  if (selectBlock) {
    selectBlock.addEventListener("click", displayCategoryModal)
    const dropdown = document.querySelector(".select-dropdown")
    const selectArrow = document.querySelector(".select-arrow")

    function displayCategoryModal() {
      dropdown.classList.toggle("showSelectModal")
      selectArrow.classList.toggle("select-arrow-rotate")
    }
  }
}

async function fetchData(PostFeed) {
  try {
    const postsData = await GetPosts()

    console.log(postsData)
    if (postsData) {
      // Do something with the data
      postsData.forEach((post) => {
        const postLink = document.createElement("div")
        // postLink.href = `post/${post.post.id}`

        console.log(post.id)
        postLink.addEventListener("click", () => {
          history.pushState({}, "", `post/${post.id}`)
          RouterFunction()
        })

        postLink.classList.add("post-link")
        if (post.categories) {
          postLink.appendChild(RenderPost(post, post.nickname))
          PostFeed.appendChild(postLink)
        } else {
          postLink.appendChild(RenderPost(post))
          PostFeed.appendChild(postLink)
        }
      })
      // postsData.forEach(post => {

      // });
    } else {
      // Handle case when response is not OK
      console.log("Error: Response not OK")
    }
  } catch (error) {
    // Handle errors that occurred during the fetch
    console.error("Error during fetch:", error)
  }
}

async function fetchUsers(usersContainer) {
  try {
    const usersData = await GetAllUsers()
    if (usersData) {
      usersContainer.appendChild(UserList(usersData))

      CONTAINER.appendChild(usersContainer)
    }
  } catch (error) {
    console.error("Error during fetch:", error)
  }
}
