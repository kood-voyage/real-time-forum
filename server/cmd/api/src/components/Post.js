export function RenderPost(data, categories) {
  console.log("yes", data)
  const { id, title, content, image_url, comment_count } = data
  console.log("data1", data)
  const post = document.createElement("div")
  post.classList.add("post")

  const postHeader = document.createElement("div")
  postHeader.classList.add("post-header")

  const postHeaderTitle = document.createElement("div")
  postHeaderTitle.classList.add("post-header-title")
  postHeaderTitle.textContent = title

  postHeader.appendChild(postHeaderTitle)

  const postBody = document.createElement("div")
  postBody.classList.add("post-body")
  const postBodyText = document.createElement("div")
  postBodyText.classList.add("post-body-text")
  postBodyText.textContent = content

  const truncatedText =
    content.length > 250 ? content.slice(0, 250) + "..." : content

  // Создаем элемент для текста

  postBodyText.className = "postBodyText"
  postBodyText.textContent = truncatedText

  // Добавляем элемент в контейнер
  postBody.appendChild(postBodyText)

  if (image_url) {
    const postBodyImg = document.createElement("img")
    postBodyImg.src = image_url
    postBodyImg.alt = "post-img"
    postBodyImg.classList.add("post-body-img")
    postBody.appendChild(postBodyImg)
  }

  if (categories) {
    const postHeaderCategory = document.createElement("p")
    postHeaderCategory.classList.add("post-header-category")
    categories.forEach((category) => {
      postHeaderCategory.textContent += category.name + " "
      postHeader.appendChild(postHeaderCategory)
    })
  }

  const postFooter = document.createElement("div")
  postFooter.classList.add("post-footer")
  const postFooterCommentsAmount = document.createElement("div")
  postFooterCommentsAmount.classList.add("post-footer-commentsAmount")
  postFooterCommentsAmount.innerHTML = `${comment_count} <span>comments</span>`
  postFooter.appendChild(postFooterCommentsAmount)

  post.appendChild(postHeader)
  post.appendChild(postBody)
  post.appendChild(postFooter)
  post.id = id

  return post
}
