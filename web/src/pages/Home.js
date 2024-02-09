import { Navbar } from '../components/Navbar.js'
import '../styles/style.css'
import '../styles/post.css'
import '../styles/messenger.css'
import '../styles/chat.css'
import '../styles/users.css'
import { RenderPost } from '../components/Post'

import { GetAllUsers, curryGetPosts } from '../helpers/ServerRequests.js'
import { CONTAINER, ROOT, USERSCONTAINER } from '../index.js'
import { RenderPostFeed } from '../components/PostFeed.js'
import { RenderFilter } from '../components/Filter.js'
import { router } from '../router/Router.js'
import { OpenMessengers, Throttle } from '../components/Messenger.js'
import {
  CheckPosition,
  PostsLoadedIndex,
  setPostsLoadedIndex
} from '../helpers/LazyLoading.js'
import { UserList } from '../components/UserList.js'

export let POSTFEED

export async function Home() {
  ROOT.innerHTML = ''
  CONTAINER.innerHTML = ''
  USERSCONTAINER.innerHTML = ''

  await Navbar()

  OpenMessengers.length = 0
  POSTFEED = RenderPostFeed()
  ROOT.append(CONTAINER)

  const getPosts = curryGetPosts()
  await fetchPosts(POSTFEED, getPosts)

  ///
  const usersData = await GetAllUsers()
  USERSCONTAINER.appendChild(UserList(usersData))
  CONTAINER.appendChild(USERSCONTAINER)

  ///

  const Filter = await RenderFilter()

  ROOT.appendChild(Filter)
  CONTAINER.appendChild(POSTFEED)
  CONTAINER.appendChild(USERSCONTAINER)

  //check for scrollin to lazy load posts
  function checkScroll() {
    window.addEventListener(
      'wheel',
      Throttle(() => CheckPosition(getPosts), 250)
    )
    window.addEventListener(
      'resize',
      Throttle(() => CheckPosition(getPosts), 250)
    )
  }
  checkScroll()

  // AddNotification("Test1", "Looool")
  // AddNotification("Test2", "sadasdasdasd")

  const selectBlock = document.querySelector('.select-block')
  if (selectBlock) {
    selectBlock.addEventListener('click', displayCategoryModal)
    const dropdown = document.querySelector('.select-dropdown')
    const selectArrow = document.querySelector('.select-arrow')

    function displayCategoryModal() {
      dropdown.classList.toggle('showSelectModal')
      selectArrow.classList.toggle('select-arrow-rotate')
    }
  }
}

export async function fetchPosts(PostFeed, getPosts) {
  try {
    const postsData = await getPosts()

    if (postsData) {
      postsData.forEach((post) => {
        // const postLink = document.createElement("div")
        // postLink.classList.add("post-link")

        // postLink.addEventListener("click", () => {
        //   history.pushState({}, "", `post/${post.post.id}`)
        //   router()
        // })

        if (post.categories) {
          PostFeed.appendChild(RenderPost(post.post, post.categories))
        } else {
          PostFeed.appendChild(RenderPost(post.post))
        }
      })
    } else {
      // Handle case when response is not OK
      console.log('Error: Response not OK')
    }
  } catch (error) {
    // Handle errors that occurred during the fetch
    console.error('Error during fetch:', error)
  }
}

///

//create a link and calls function to create post out of provided data
// export function ProcessPostData(post) {
//   const postLink = document.createElement("div")

//   postLink.addEventListener("click", () => {
//     history.pushState({}, "", `post/${post.id}`)
//     setPostsLoadedIndex(0)
//     router()
//   })

//   postLink.classList.add("post-link")

//   if (post.categories) {
//     postLink.appendChild(RenderPost(post.post, post.nickname))
//   } else {
//     postLink.appendChild(RenderPost(post.post))
//   }

//   return postLink
// }

///

async function fetchUsers(usersContainer) {
  try {
    const usersData = await GetAllUsers()
    if (usersData) {
      usersContainer.appendChild(UserList(usersData))

      CONTAINER.appendChild(usersContainer)
    }
  } catch (error) {
    console.error('Error during fetch:', error)
  }
}
