import { Navbar } from '../components/Navbar.js'
import '../styles/profile.css'

import { RenderProfile, profileContainer } from '../components/Profile.js'

import { ROOT, CONTAINER, USERSCONTAINER } from '../index.js'
import {
  GetAllUsers,
  GetUserInfo,
  isLoggedIn
} from '../helpers/ServerRequests.js'
import { UserList } from '../components/UserList.js'

export async function Profile() {
  ROOT.innerHTML = ''
  CONTAINER.innerHTML = ''
  profileContainer.innerHTML = ''
  USERSCONTAINER.innerHTML = ''

  await Navbar()

  const usersData = await GetAllUsers()
  USERSCONTAINER.appendChild(UserList(usersData))
  CONTAINER.appendChild(USERSCONTAINER)

  const userId = await isLoggedIn()
  const userInfo = await GetUserInfo(userId)

  const Profile = RenderProfile(userInfo.data)

  CONTAINER.appendChild(Profile)
  ROOT.appendChild(CONTAINER)
}
