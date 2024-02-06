import { ProcessPostData } from "../pages/Home";
import { GetPosts } from "./ServerRequests"


export function Throttle(callee,timeout){
    let timer = null

    return function perform(...args){
        if(timer) return
        timer = setTimeout(()=>{
            callee(...args)

        clearTimeout(timer)
        timer = null
        },timeout)
    }
}



let _PostsLoadedIndex = 0;

export const getPostsLoadedIndex = () => {
  return _PostsLoadedIndex;
};

export const setPostsLoadedIndex = (value) => {
  _PostsLoadedIndex = value;
};
 let postsLoaded = false;

export async function CheckPosition() {
    console.log("Entering CheckPosition");
    const height = document.body.offsetHeight;
    const screenHeight = window.innerHeight;

    const scrolled = window.scrollY;
    const threshold = height - screenHeight / 4;

    const position = scrolled + screenHeight;

    const PostFeed = document.querySelector(".post-feed");

    if (!PostFeed) {
        console.error("Element with class 'post-feed' not found");
        return;
    }
console.log(postsLoaded);
    if (position >= threshold && !postsLoaded) {
        console.log("LOAD!");
        const currentValue = getPostsLoadedIndex();
        setPostsLoadedIndex(currentValue + 1);
        postsLoaded = true;
        try {
            const currentValue = getPostsLoadedIndex();
            const postData = await GetPosts(currentValue);
            if (postData) {
                postData.forEach((post) => {
                    const postLink = ProcessPostData(post);
                    PostFeed.appendChild(postLink);
                });
                postsLoaded = false;
            } else {
                // Handle case when response is not OK
                console.log("Error: Response not OK");
            }
        } catch (error) {
            // Handle errors that occurred during the fetch
            console.error("Error during fetch:", error);
        }
    } else if (position < threshold) {
        // Reset postsLoaded when scrolling back up
        postsLoaded = false;
    }
}
