import { CONTAINER, ROOT, USERSCONTAINER } from '../index'
import { Navbar } from '../components/Navbar.js'
import { GLOBAL_URL } from '../config'
import { GetAllUsers, SinglePostRequest } from '../helpers/ServerRequests'
import '../styles/separatePost.css'
import {
  CreateCommentContainer,
  CreatePostUi,
  createCommentsContainer
} from './PostCreateUi'
import { UserList } from '../components/UserList.js'

export async function Post(postId) {
  ROOT.innerHTML = ''
  CONTAINER.innerHTML = ''
  USERSCONTAINER.innerHTML = ''

  await Navbar()

  const usersData = await GetAllUsers()
  USERSCONTAINER.appendChild(UserList(usersData))
  CONTAINER.appendChild(USERSCONTAINER)

  ROOT.append(CONTAINER)
  postId = postId['id']
  const apiUrl = GLOBAL_URL + `/api/v1/jwt/posts/${postId}`

  SinglePostRequest(apiUrl, 'GET')
    .then((data) => {
      const pagePost = CreatePostUi(data, postId)
      const commentContainer = CreateCommentContainer(postId)

      CONTAINER.appendChild(pagePost)
      CONTAINER.appendChild(commentContainer)

      if (data.data.comments) {
        const commentsContainer = createCommentsContainer(data)
        CONTAINER.appendChild(commentsContainer)
      }

      //function to send request to create comment
    })
    .catch((error) => {
      console.error('Error in fetch operation:', error)
    })
}
