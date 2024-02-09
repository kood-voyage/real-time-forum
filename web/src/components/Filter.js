import searchSvg from '../assets/img//search.svg'
import arrowSvg from '../assets/img/arrow.svg'
import { GetCategories, curryGetPosts } from '../helpers/ServerRequests'
import { POSTFEED, fetchPosts } from '../pages/Home'

export async function RenderFilter() {
  // Create info-div container
  const infoDiv = document.createElement('div')
  infoDiv.classList.add('filter')

  // Create input-select-block
  const inputSelectBlock = document.createElement('div')
  inputSelectBlock.classList.add('input-select-block')

  // Input Block
  const inputBlock = document.createElement('div')
  inputBlock.classList.add('input-block')

  const searchInput = document.createElement('input')
  searchInput.type = 'text'
  searchInput.classList.add('search_input')
  searchInput.placeholder = 'Search'
  searchInput.maxLength = 15

  const searchIcon = document.createElement('img')
  searchIcon.src = searchSvg // Assuming searchSvg is a variable holding the path to your SVG
  searchIcon.alt = ''
  searchIcon.classList.add('search-icon')

  inputBlock.appendChild(searchInput)
  inputBlock.appendChild(searchIcon)

  // Select Block
  const selectBlock = document.createElement('div')
  selectBlock.classList.add('select-block')

  const categoryText = document.createElement('p')
  categoryText.textContent = '...select category'

  const selectArrow = document.createElement('img')
  selectArrow.src = arrowSvg // Assuming arrowSvg is a variable holding the path to your SVG
  selectArrow.alt = 'arrow'
  selectArrow.classList.add('select-arrow')

  const selectDropdown = document.createElement('div')
  selectDropdown.classList.add('select-dropdown')

  // Sample categories
  const categories = [{ name: 'all', id: '' }, ...(await GetCategories())]

  categories.forEach((category) => {
    const categoryOption = document.createElement('div')
    categoryOption.className = 'select-category-el'
    categoryOption.textContent = category.name

    categoryOption.addEventListener('click', (e) => {
      e.preventDefault()
      POSTFEED.innerHTML = ''
      const getPosts = curryGetPosts(category.id)
      fetchPosts(POSTFEED, getPosts)
      categoryText.textContent = category.name
    })

    selectDropdown.appendChild(categoryOption)
  })

  selectBlock.appendChild(categoryText)
  selectBlock.appendChild(selectArrow)
  selectBlock.appendChild(selectDropdown)

  // Append input-block and select-block to input-select-block
  // inputSelectBlock.appendChild(inputBlock)
  inputSelectBlock.appendChild(selectBlock)

  // Append input-select-block to info-div
  infoDiv.appendChild(inputSelectBlock)

  return infoDiv
}
