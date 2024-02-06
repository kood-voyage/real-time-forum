import { CONTAINER, ROOT } from "../index"
import { Navbar } from "../components/Navbar.js"
import { GLOBAL_URL } from "../config.js"
import { SinglePostRequest } from "../helpers/ServerRequests.js"
import "../styles/separatePost.css"
import {
  CreateCommentContainer,
  CreatePostUi,
  createCommentsContainer,
} from "./PostCreateUi.js"

export async function Post(postId) {
    ROOT.innerHTML = ""
    CONTAINER.innerHTML = ""
    await Navbar()
    ROOT.append(CONTAINER)
    postId = postId["id"]
    const apiUrl = GLOBAL_URL + `/api/v1/jwt/posts/${postId}`

  SinglePostRequest(apiUrl, "GET")
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
      console.error("Error in fetch operation:", error)
    })
}
