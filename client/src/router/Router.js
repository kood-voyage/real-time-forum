import { isLoggedIn } from "../helpers/ServerRequests.js"
import { Home } from "../pages/home/Home.js"
import { Login } from "../pages/login/Login.js"
import { CreatePost } from "../pages/createPost/CreatePostPage.js"
import { Profile } from "../pages/profile/ProfilePage.js"
import { Register } from "../pages/register/Register.js"
import { Post } from "../pages/separatePost/SeparatePostPage.js"
import { NotFound } from "../pages/notfound/NotFound.js"

const authMiddleware = async (params) => {
    const isUserLogged = await isLoggedIn();

    if (!isUserLogged) {
        console.log('User not logged in. Redirect or handle accordingly.');
        window.location.href = '/login';
    }

    // Continue to the next middleware or route handler
    return params;
};

const routes = [
    { path: '/', view: Home, middleware: [authMiddleware] },
    { path: '/login', view: Login },
    { path: '/register', view: Register },
    { path: '/create-post', view: CreatePost, middleware: [authMiddleware] },
    { path: '/profile', view: Profile, middleware: [authMiddleware] },
    { path: '/post/:id', view: Post, middleware: [authMiddleware] },
    { path: '.*', view: NotFound },
];

const matchRoute = (path, route) => {
    const routePathSegments = route.path.split('/');
    const urlPathSegments = path.split('/');

    if (routePathSegments.length !== urlPathSegments.length) {
        return false;
    }

    const params = {};

    for (let i = 0; i < routePathSegments.length; i++) {
        if (routePathSegments[i].startsWith(':')) {
            const paramName = routePathSegments[i].slice(1);
            params[paramName] = urlPathSegments[i];
        } else if (routePathSegments[i] !== urlPathSegments[i]) {
            return false;
        }
    }

    return params;
};

const findMatchingRoute = async (path, routes) => {
    for (const route of routes) {
        const params = matchRoute(path, route);
        if (params) {
            // Execute middleware before rendering the view
            const updatedParams = route.middleware
                ? await route.middleware.reduce(async (prev, middleware) => {
                    return await middleware(await prev);
                }, Promise.resolve(params))
                : params;

            return { route, params: updatedParams };
        }
    }

    // No matching route found, render the "not found" view
    return { route: { view: NotFound }, params: {} };
};

export const RouterFunction = async () => {
    const { route, params } = await findMatchingRoute(location.pathname, routes) || {
        route: routes[0],
        params: {},
    };

    await route.view(params);
};


const navigateTo = async url => {
    history.pushState(null, null, url);
    RouterFunction();

  if (path.startsWith("/post/")) {
    const postId = path.split("/")[2]
    RenderSeparatePostPage(postId)
  } else {
    try {
      const userLoggedIn = await CheckUserLoggedIn()

      switch (path) {
        case "/":
          if (!userLoggedIn) {
            RenderLoginPage()
            return
          }
          RenderHomePage()
          break
        case "/login":
          RenderLoginPage()
          break
        case "/register":
          RenderRegisterPage()
          break
        case "/create-post":
          if (!userLoggedIn) {
            RenderLoginPage()
            return
          }
          RenderPostPage()
          break
        case "/profile":
          if (!userLoggedIn) {
            RenderLoginPage()
            return
          }

          RenderProfilePage()
          break
        default:
          if (!userLoggedIn) {
            RenderLoginPage()
            return
          }
          RenderNotFound(path)
      }
    } catch (error) {
      console.error("Error checking user login:", error)
    }
  }

}

// const router = async () => {
//     const routes = [
//         { path: '/', view: Main },
//         { path: '/posts', view: Posts },
//         { path: '/settings', view: Settings }
//     ];
//
//     const potentialMatches = routes.map(route => {
//         return {
//             route: route,
//             isMatch: location.pathname === route.path
//         }
//     });
//
//     let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);
//
//     if (!match) {
//         match = {
//             route: routes[0],
//             isMatch: true
//         }
//     }
//
//     const view = new match.route.view();
//     document.getElementById('container').innerHTML = await view.getHtml();
// }

window.addEventListener('popstate', RouterFunction);

document.addEventListener('DOMContentLoaded', () => {
    RouterFunction();
});

document.addEventListener('click', e => {
    if (e.target.className === 'link') {
        e.preventDefault();
        navigateTo(e.target.href);
    }
});
