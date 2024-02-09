import { GLOBAL_URL } from '../config'
import { SinglePostRequest } from '../helpers/ServerRequests'
import { router } from '../router/Router'
import { CreateCommentComponent } from '../components/Comment'
import { CONTAINER } from '../index'

export function CreatePostUi(data, postId) {
  const postData = data.data.post

  const { title, content, timestamp, nickname } = postData

  // Create elements using the received data
  const pagePost = document.createElement('div')
  pagePost.className = 'pagePost'

  const postPagePostHeader = document.createElement('div')
  postPagePostHeader.className = 'postPagePostHeader'

  const authorHeader = document.createElement('h5')
  authorHeader.textContent = `${nickname}`

  const titleHeader = document.createElement('h2')
  titleHeader.textContent = title

  postPagePostHeader.appendChild(authorHeader)
  postPagePostHeader.appendChild(titleHeader)

  const postPagePostBody = document.createElement('div')
  postPagePostBody.className = 'postPagePostBody'

  const postPageBodyText = document.createElement('div')
  postPageBodyText.className = 'postPageBodyText'
  postPageBodyText.textContent = content

  const postPageBodyImg = document.createElement('div')
  postPageBodyImg.className = 'postPageBodyImg'

  // Assuming your API returns an image URL
  if (postData.image_url) {
    const img = document.createElement('img')
    img.src = postData.image_url
    img.alt = ''
    postPageBodyImg.appendChild(img)
  }

  postPagePostBody.appendChild(postPageBodyText)
  postPagePostBody.appendChild(postPageBodyImg)

  const postPagePostFooter = document.createElement('div')
  postPagePostFooter.className = 'postPagePostFooter'

  if (postData.categories) {
    const categoriesDiv = document.createElement('div')
    data.categories.forEach(
      (category) => (categoriesDiv.textContent += category.name + ' ')
    )
    postPagePostFooter.appendChild(categoriesDiv)
  }

  const timeDiv = document.createElement('div')
  timeDiv.className = 'time'

  const dateObject = new Date(timestamp)

  const formattedDate = dateObject.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  timeDiv.textContent = formattedDate

  postPagePostFooter.appendChild(timeDiv)

  pagePost.appendChild(postPagePostHeader)
  pagePost.appendChild(postPagePostBody)
  pagePost.appendChild(postPagePostFooter)

  const userNickname = document.querySelector('.username')

  if (userNickname.textContent === nickname) {
    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'Delete post'
    deleteBtn.className = 'PostDeleteBtn'
    pagePost.appendChild(deleteBtn)
    //function to send request to delete post
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault()

      SinglePostRequest(
        `${GLOBAL_URL}/api/v1/jwt/posts/delete/${postId}`,
        'DELETE',

        {
          'Content-Type': 'application/json'
        }
      )
        .then(() => {
          history.pushState({}, '', `/`)
          router()
        })
        .catch((error) => {
          console.error('Error in fetch operation:', error)
        })
    })
  }

  return pagePost
}

export function CreateCommentContainer(postId) {
  // Create the comment container elements
  const commentContainer = document.createElement('div')
  commentContainer.className = 'createCommentContainer'

  const textarea = document.createElement('textarea')
  textarea.placeholder = 'Enter your comment text'
  textarea.cols = '30'
  textarea.rows = '4'
  textarea.classList.add('comment-textarea')

  const createCommentbutton = document.createElement('button')
  createCommentbutton.textContent = 'Send'

  // Append textarea and button to the comment container
  commentContainer.appendChild(textarea)
  commentContainer.appendChild(createCommentbutton)

  createCommentbutton.addEventListener('click', async () => {
    const commentText = textarea.value.trim()

    if (commentText !== '') {
      const createCommentUrl = GLOBAL_URL + '/api/v1/jwt/comments/create'

      const commentData = {
        post_id: postId,
        content: commentText
      }

      try {
        const response = await fetch(createCommentUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(commentData),
          credentials: 'include'
        })

        if (response.ok) {
          console.log('Comment created successfully')
          const result = await response.json()

          addPostToCommentsContainer(result)

          document.querySelector('.comment-textarea').value = ''
          // You may want to handle success, update UI, etc.
        } else {
          console.error('Failed to create comment')
          // Handle the error, display a message, etc.
        }
      } catch (error) {
        console.error('Error in fetch operation:', error)
        // Handle network error, etc.
      }
    } else {
      console.log('Comment text is empty')
      // Handle the case where the comment text is empty
    }
  })

  return commentContainer
}

export function addPostToCommentsContainer(data) {
  const commentsContainer = document.querySelector('.commentsContainer')
  const userNickname = document.querySelector('.username')

  const postElement = CreateCommentComponent(
    data.data.datetime,
    data.data.content,
    userNickname.textContent,
    data.data.id
  )

  if (commentsContainer) {
    commentsContainer.insertBefore(postElement, commentsContainer.firstChild)
  } else {
    const commentsContainer = document.createElement('div')
    commentsContainer.className = 'commentsContainer'
    commentsContainer.appendChild(postElement)
    CONTAINER.appendChild(commentsContainer)
  }

  return true
}

export function createCommentsContainer(data) {
  const commentsContainer = document.createElement('div')
  commentsContainer.className = 'commentsContainer'
  const commentDiv = document.createElement('div')
  commentDiv.className = 'comment'
  data.data.comments.reverse().forEach((comment) =>
    commentsContainer.appendChild(
      CreateCommentComponent(
        comment.comment.datetime,
        comment.comment.content,
        comment.comment.nickname,

        comment.comment.id
      )
    )
  )
  return commentsContainer
}
