import { GLOBAL_URL } from "../config"
import { SinglePostRequest } from "../helpers/ServerRequests"

export function CreateCommentComponent(createTime, text, author, id) {
  console.log(id);
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
  const userNickname = document.querySelector(".username")

  commentAuthorDiv.textContent = `Author: ${author}`




  commentDiv.appendChild(createTimeDiv)
  commentDiv.appendChild(commentTextBlockDiv)
  commentDiv.appendChild(commentAuthorDiv)


  commentDiv.id = `comment-${id}`;



  if(userNickname.textContent === author){
    const deleteCommentButton = document.createElement("button")
    deleteCommentButton.className = "delete-comment"
    deleteCommentButton.textContent = "Delete"
    commentDiv.appendChild(deleteCommentButton)

  deleteCommentButton.addEventListener("click", async (e) => {
    try {
      await SinglePostRequest(`${GLOBAL_URL}/api/v1/jwt/comments/delete/${id}`, "DELETE");
      document.querySelector(`#comment-${id}`).remove();

    } catch (error) {
      console.error("Error deleting comment:", error);
      // Handle error, display message, etc.
    }
  });
  }

  return commentDiv
}
