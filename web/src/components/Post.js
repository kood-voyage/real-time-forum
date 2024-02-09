import { router } from '../router/Router'

export function RenderPost(data, categories) {
  const { id, title, content, image_url, comment_count } = data

  const post = document.createElement('div')
  post.classList.add('post')

  const postHeader = document.createElement('div')
  postHeader.classList.add('post-header')

  if (categories) {
    const tags = document.createElement('div')
    tags.className = 'tags'

    categories.forEach((category) => {
      const categoryTag = document.createElement('span')
      categoryTag.className = 'category-tag'

      categoryTag.textContent = category.name

      tags.appendChild(categoryTag)
    })

    postHeader.appendChild(tags)
  }

  const postHeaderTitle = document.createElement('div')
  postHeaderTitle.classList.add('post-header-title')
  postHeaderTitle.textContent = title

  postHeader.appendChild(postHeaderTitle)

  const postBody = document.createElement('div')
  postBody.classList.add('post-body')
  const postBodyText = document.createElement('div')
  postBodyText.className = 'post-body-text'
  postBodyText.textContent = content

  postBody.appendChild(postBodyText)

  if (image_url) {
    const postBodyImg = document.createElement('img')
    postBodyImg.src = image_url
    postBodyImg.alt = 'post-img'
    postBodyImg.classList.add('post-body-img')
    postBody.appendChild(postBodyImg)
  }

  const postFooter = document.createElement('div')
  postFooter.classList.add('post-footer')
  const postFooterCommentsAmount = document.createElement('div')
  postFooterCommentsAmount.classList.add('post-footer-commentsAmount')
  postFooterCommentsAmount.innerHTML = `${comment_count} <span>comments</span>`
  postFooter.appendChild(postFooterCommentsAmount)

  post.appendChild(postHeader)
  post.appendChild(postBody)
  post.appendChild(postFooter)
  post.id = id

  post.addEventListener('click', () => {
    history.pushState({}, '', `post/${id}`)
    router()
  })

  return post
}
