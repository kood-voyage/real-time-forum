import { Navbar } from '../components/Navbar.js'
import { router } from '../router/Router'
import '../styles/create-post.css'
import addCategory from '../assets/img/addCategory.svg'
import postImgIcon from '../assets/img/postImgIcon.svg'
import closeIcon from '../assets/img/close.svg'
import { GLOBAL_URL } from '../config.js'
import { CONTAINER, ROOT, USERSCONTAINER } from '../index.js'
import { GetAllUsers, GetUserInfo } from '../helpers/ServerRequests.js'
import { UserList } from '../components/UserList.js'

export async function CreatePost() {
  ROOT.innerHTML = ''
  CONTAINER.innerHTML = ''
  USERSCONTAINER.innerHTML = ''
  await Navbar()

  CONTAINER.innerHTML = `
<div class="create-post-container">

  <form
    type="submit"
    action="/create-post"
    class="create-post-form"
    method="POST"
  >
    <div class="post-title-container">
      <label>Title</label>

      <input type="title" placeholder="Title" pattern=".*\S+.*" required maxlength="100" name="title" />
    </div>

    <div class="label-container" >
      <label>Body</label>
      <textarea
        name=""
        id=""
        class="post-textarea"
        cols="20"
        rows="5"

      ></textarea>
      <div class="category-container"></div>
    </div>
    <div class="add-category-container">
    <div class ="add-category-sub">
    <input type="text" name="add-category" class="add-category-input"  placeholder="Add category" required maxlength="15"/>

    <button class="input-add-category-btn">Add</button></div>
    </div>


    <div class="image-preview-container"></div>

    <div class="add-post-button-container">
      <button class="add-post-button">SUBMIT POST</button>
    </div>
  </form>
</div>
`

  const usersData = await GetAllUsers()
  USERSCONTAINER.appendChild(UserList(usersData))
  CONTAINER.appendChild(USERSCONTAINER)

  ROOT.appendChild(CONTAINER)

  const addCategorySubDiv = document.querySelector('.add-category-sub')

  const categoryInputBtn = document.querySelector('.input-add-category-btn')
  categoryInputBtn.addEventListener('click', (e) => addCategoryToPost(e))

  const categoryInputValue = document.querySelector('.add-category-input')
  const categoryContainer = document.querySelector('.category-container')

  function addCategoryToPost(e) {
    e.preventDefault()

    const categoryValue = categoryInputValue.value.trim().toLowerCase()

    // Check for valid characters (A-Z)
    const validCharsRegex = /^[a-zA-Z]+$/
    if (!validCharsRegex.test(categoryValue)) {
      alert('Invalid characters. Please enter only letters from A to Z.')
      return
    }

    // Check for duplicate entries
    const lowerCaseCategoryValue = categoryValue.toLowerCase()
    for (var i = 0; i < categoryContainer.children.length; i++) {
      var elementInnerText =
        categoryContainer.children[i].innerText.toLowerCase()
      if (elementInnerText === lowerCaseCategoryValue) {
        alert('Category already exists. Please enter a unique category.')
        return // Exit the function if it's a duplicate
      }
    }

    const maxCategories = 3

    if (categoryContainer.children.length >= maxCategories) {
      alert('You can only add up to 3 categories.')
      return
    }

    if (categoryValue !== '') {
      const categoryElement = document.createElement('div')
      categoryElement.textContent = categoryValue
      categoryContainer.appendChild(categoryElement)

      categoryInputValue.value = ''
    }
  }

  //add error block
  const errorMessage = document.createElement('div')
  errorMessage.classList.add('PosterrorMessage')
  const textarea = document.querySelector('.post-textarea')
  textarea.insertAdjacentElement('afterend', errorMessage)

  //add image error block
  /////////
  //ADD IMAGE

  const imgBtn = document.querySelector('.add-image-button')
  const imgInput = document.querySelector('.add-image-input')

  const sendPostDataBtn = document.querySelector('.add-post-button')
  sendPostDataBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const postTitleInput = document.querySelector('input[name="title"]')
    const postContentTextarea = document.querySelector('.post-textarea')
    const postCategories = Array.from(
      document.querySelector('.category-container').children
    ).map((category) => category.textContent)
    const postImageWrapper = document.querySelector(
      '.image-preview-wrapper img'
    )

    const title = postTitleInput.value
    const content = postContentTextarea.value
    const categories = postCategories
    const image = postImageWrapper ? postImageWrapper.src : null

    if (title !== '' && content != '' && categories.length !== 0) {
      sendPostData(title, content, categories, image)
    } else if (title !== '' && content != '') {
      errorMessage.textContent = 'Please add at least one category'
    } else {
      errorMessage.textContent = 'Please fill in all fields'
    }
  })
}

///

async function sendPostData(title, content, categories, image) {
  const url = GLOBAL_URL + '/api/v1/jwt/posts/create'
  const requestBody = {
    post: {
      title: title,
      content: content,
      image_url: image
    },
    categories: categories.map((categoryName) => ({
      name: categoryName,
      description: `Description for ${categoryName}`
    }))
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const data = await response.json()

      window.history.pushState({}, '', '/')
      router()
    } else {
      console.error('Server error:', response.statusText)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

//we removed ability to add images
// <div class="img-button-container">
// <input type="file" name="add-image" class="add-image-input">
//   <button class="add-image-button">Image<img class="add-img-icon" src=${postImgIcon}  alt="addimg"></button>
// </div>

///
// imgBtn.addEventListener("click", (e) => {
//   e.preventDefault()
//   imgInput.click()
// })

// imgInput.addEventListener("change", (e) => changeInputHandler(e))

// function changeInputHandler(e) {
//   const file = e.target.files[0]
//   if (!file.type.match("image")) {
//     alert("File must be an image.")
//     return
//   }

//   const reader = new FileReader()

//   reader.onload = (e) => {
//     const imgPreviewContainer = document.querySelector(
//       ".image-preview-container"
//     )

//     // Check if an existing preview is present
//     const existingPreview = document.querySelector(".image-preview-wrapper")

//     // If an existing preview is found, remove it
//     if (existingPreview) {
//       existingPreview.remove()
//     }

//     // Create a wrapper div for the image and close button
//     const wrapperDiv = document.createElement("div")
//     wrapperDiv.classList.add("image-preview-wrapper")

//     // Create the preview image
//     const previewImg = document.createElement("img")
//     previewImg.src = e.target.result
//     previewImg.classList.add("image-preview")

//     // Create the close button
//     const closePostImg = document.createElement("img")
//     closePostImg.src = closeIcon
//     closePostImg.classList.add("close-post-img")

//     // Append the close button and preview image to the wrapper
//     wrapperDiv.appendChild(previewImg)
//     wrapperDiv.appendChild(closePostImg)

//     // Append the wrapper to the preview container
//     imgPreviewContainer.appendChild(wrapperDiv)

//     closePostImg.addEventListener("click", () => {
//       wrapperDiv.remove()
//     })
//   }

//   reader.readAsDataURL(file)
// }

///
