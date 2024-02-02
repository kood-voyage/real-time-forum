import { GLOBAL_URL } from "../config"
import { SinglePostRequest } from "../helpers/ServerRequests"

export function CreateCommentComponent(createTime, text, author, id) {
  const commentDiv = document.createElement("div")
  commentDiv.className = "comment"

  const createTimeDiv = document.createElement("div")
  createTimeDiv.className = "commentCreateTime"

  const dateObject = new Date(createTime)

  const formattedCommentDate = dateObject.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  createTimeDiv.textContent = formattedCommentDate

  const commentTextBlockDiv = document.createElement("div")
  commentTextBlockDiv.className = "commentTextBlock"

  const commentTextParagraph = document.createElement("p")
  commentTextParagraph.className = "commentText"
  commentTextParagraph.textContent = text

  commentTextBlockDiv.appendChild(commentTextParagraph)

  const commentAuthorDiv = document.createElement("div")
  commentAuthorDiv.className = "comment-author"
  commentAuthorDiv.textContent = `Author: ${author}`

  const deleteCommentButton = document.createElement("button")
  deleteCommentButton.className = "delete-comment"
  deleteCommentButton.textContent = "Delete"

  commentDiv.appendChild(createTimeDiv)
  commentDiv.appendChild(commentTextBlockDiv)
  commentDiv.appendChild(commentAuthorDiv)
  commentDiv.appendChild(deleteCommentButton)

  commentDiv.id = `comment-${id}`;


  deleteCommentButton.addEventListener("click", async (e) => {
    try {
      await SinglePostRequest(`${GLOBAL_URL}/api/v1/jwt/comments/delete/${id}`, "DELETE");
      console.log(id);
      document.querySelector(`#comment-${id}`).remove();
    } catch (error) {
      console.error("Error deleting comment:", error);
      // Handle error, display message, etc.
    }
  });

  return commentDiv
}
