import { isLoggedIn } from '../helpers/ServerRequests.js'
import { Home } from '../pages/Home.js'
import { Login } from '../pages/Login.js'
import { CreatePost } from '../pages/CreatePost.js'
import { Profile } from '../pages/Profile.js'
import { Register } from '../pages/Register.js'
import { Post } from '../pages/Post.js'
import { NotFound } from '../pages/NotFound'
import { Socket, initializeWebSocket } from '../index.js'
import { GLOBAL_URL } from '../config.js'
export let CURRENTUSER
const authMiddleware = async (params) => {
  const isUserLogged = await isLoggedIn()

  if (!isUserLogged) {
    console.log('User not logged in. Redirect or handle accordingly.')
    window.location.href = '/login'
  }

  return params
}

const checkWebSocketConn = (params) => {
  const isSocketConnected = typeof Socket != undefined
  if (isSocketConnected) {
    initializeWebSocket()
  }
  return params
}

export const checkUserId = (params) => {
  fetch(GLOBAL_URL + `/api/v1/auth/checkCookie`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      if (CURRENTUSER != undefined && CURRENTUSER != data.data) {
        window.location.href = '/'
        return
      }
      CURRENTUSER = data.data
    })

  return params
}

const routes = [
  {
    path: '/',
    view: Home,
    middleware: [authMiddleware, checkWebSocketConn, checkUserId]
  },
  { path: '/login', view: Login },
  { path: '/register', view: Register },
  {
    path: '/create-post',
    view: CreatePost,
    middleware: [authMiddleware, checkWebSocketConn, checkUserId]
  },
  {
    path: '/profile',
    view: Profile,
    middleware: [authMiddleware, checkWebSocketConn, checkUserId]
  },
  {
    path: '/post/:id',
    view: Post,
    middleware: [authMiddleware, checkWebSocketConn, checkUserId]
  },
  { path: '.*', view: NotFound }
]

const matchRoute = (path, route) => {
  const routePathSegments = route.path.split('/')
  const urlPathSegments = path.split('/')

  if (routePathSegments.length !== urlPathSegments.length) {
    return false
  }

  const params = {}

  for (let i = 0; i < routePathSegments.length; i++) {
    if (routePathSegments[i].startsWith(':')) {
      const paramName = routePathSegments[i].slice(1)
      params[paramName] = urlPathSegments[i]
    } else if (routePathSegments[i] !== urlPathSegments[i]) {
      return false
    }
  }

  return params
}

const findMatchingRoute = async (path, routes) => {
  for (const route of routes) {
    const params = matchRoute(path, route)
    if (params) {
      // Execute middleware before rendering the view
      const updatedParams = route.middleware
        ? await route.middleware.reduce(async (prev, middleware) => {
            return await middleware(await prev)
          }, Promise.resolve(params))
        : params

      return { route, params: updatedParams }
    }
  }

  // No matching route found, render the "not found" view
  return { route: { view: NotFound }, params: {} }
}

export const router = async () => {
  const { route, params } = (await findMatchingRoute(
    location.pathname,
    routes
  )) || {
    route: routes[0],
    params: {}
  }

  await route.view(params)
}

window.addEventListener('popstate', router)

document.addEventListener('click', (e) => {
  if (e.target.className === 'link') {
    e.preventDefault()
    navigateTo(e.target.href)
  }
})

const navigateTo = (url) => {
  history.pushState(null, null, url)
  router()
}
