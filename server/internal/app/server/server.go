package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"forum/server/pkg/jwttoken"
	"log"
	"net/http"
	"os"
	"time"

	"forum/server/internal/models"
	"forum/server/internal/store"
	"forum/server/pkg/router"
)

const (
	sessionName     = "session"
	jwtKey          = "JWT_KEY"
	ctxKeyRequestID = iota
	ctxUserID
)

type server struct {
	router *router.Router
	logger *log.Logger
	store  store.Store
}

func newServer(store store.Store) *server {
	s := &server{
		router: router.NewRouter(),
		logger: log.Default(),
		store:  store,
	}

	s.configureRouter()

	return s
}

func (s *server) configureRouter() {
	// Using middlewares
	s.router.Use(s.setRequestID)
	s.router.Use(s.logRequest)
	s.router.Use(s.CORSMiddleware)

	s.router.HandleFunc("POST", "/api/v1/users/create", s.handleUsersCreate())
	s.router.HandleFunc("POST", "/api/v1/users/login", s.handleUsersLogin())
	s.router.HandleFunc("GET", "/api/v1/auth/checkCookie", s.handleCheckCookie())
	s.router.HandleFunc("GET", "/api/v1/logout", s.handleLogOut())

	s.router.UseWithPrefix("/jwt", s.jwtMiddleware)

	s.router.HandleFunc("POST", "/api/v1/jwt/posts/create", s.handlePostCreation())
	s.router.HandleFunc("POST", "/api/v1/jwt/comments/create", s.handleCommentCreation())

	// s.router.HandleFunc("GET", "/api/v1/comments/findById", s.handleCommentGetById())
	s.router.HandleFunc("GET", "/api/v1/jwt/categories/getAll", s.handleGetAllCategories())
	s.router.HandleFunc("GET", "/api/v1/jwt/posts/findById", s.serveSinglePostInformation())
	s.router.HandleFunc("POST", "/api/v1/jwt/posts/getFeed", s.handleAllPostInformation())
	s.router.HandleFunc("GET", "/api/v1/jwt/users/getUser", s.handleUsersGetByID())
	// -------------------- REACTION PATHS --------------------------- //
	s.router.HandleFunc("GET", "/api/v1/jwt/reactions/getAll", s.handleGetReactionsOptions())
	s.router.HandleFunc("POST", "/api/v1/jwt/reactions/addToParent", s.handleAddReactionsToParent())
	s.router.HandleFunc("GET", "/api/v1/jwt/reactions/getByUserParentID", s.handleGetUserReactions())
	s.router.HandleFunc("GET", "/api/v1/jwt/reactions/getByParentID", s.handleGetReactionsByParentID())
	// EXAMPLE OF DYNAMIC PATH
	// s.router.HandleFunc("GET", "/api/v1/jwt/users/:test", s.handleTest())
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

// EXAMPLE OF DYNAMIC PATH
//
//	func (s *server) handleTest() http.HandlerFunc {
//		return func(w http.ResponseWriter, r *http.Request) {
//			value := router.Param(r.Context(), "test")
//			fmt.Println("RETRIED VALUE", value)
//			s.respond(w, r, http.StatusOK, nil)
//		}
//	}
//

// {{{
func (s *server) handleCheckCookie() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(sessionName)
		if err != nil {
			s.error(w, r, http.StatusUnauthorized, err)
			return
		}

		alg := jwttoken.HmacSha256(os.Getenv(jwtKey))
		err = alg.Validate(cookie.Value)
		if err != nil {
			s.error(w, r, http.StatusUnauthorized, err)
			return
		}

		s.respond(w, r, http.StatusOK, nil)
	}
}

func (s *server) handleLogOut() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Replace the cookie with expired cookie
		deletedCookie := http.Cookie{
			Name:     sessionName,
			Value:    "",
			Expires:  time.Now().Add(-1 * time.Hour),
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode,
		}

		http.SetCookie(w, &deletedCookie)

		s.respond(w, r, http.StatusOK, nil)
	}
}

func (s *server) handleUsersLogin() http.HandlerFunc {
	type RequestBody struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		var requestBody RequestBody
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		user, err := s.store.User().Check(requestBody.Email)
		if err != nil || !user.ComparePassword(requestBody.Password) {
			s.error(w, r, http.StatusUnauthorized, errors.New("invalid login credentials"))
			return
		}

		expiration := time.Now().Add(5 * time.Hour)
		alg := jwttoken.HmacSha256(os.Getenv(jwtKey))
		claims := jwttoken.NewClaims(user.ID, expiration.Unix())
		token, err := alg.Encode(claims)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		cookie := http.Cookie{
			Name:     sessionName,
			Value:    token,
			Expires:  expiration,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode,
		}

		http.SetCookie(w, &cookie)

		s.respond(w, r, http.StatusOK, nil)
	}
}

func (s *server) handleUsersGetByID() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// get id from cookie
		userID := r.Context().Value(ctxUserID).(string)

		user, err := s.store.User().FindByID(userID)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		s.respond(w, r, http.StatusCreated, user)
	}
}

func (s *server) handleUsersCreate() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := &models.User{}
		if err := json.NewDecoder(r.Body).Decode(user); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		if err := s.store.User().Create(user); err != nil {
			s.error(w, r, http.StatusUnprocessableEntity, err)
			return
		}

		s.respond(w, r, http.StatusCreated, nil)
	}
}

// }}}
// -------------------------CATEGORY STUFF--------------------------//
// {{{
func (s *server) handleGetAllCategories() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		categories, err := s.store.Category().GetAll()
		if err != nil {
			s.error(w, r, http.StatusUnprocessableEntity, err)
		}
		s.respond(w, r, http.StatusOK, categories)
	}
}

// }}}
// -------------------------POST STUFF--------------------------//
// {{{
func (s *server) handlePostCreation() http.HandlerFunc {
	type request struct {
		Post       models.Post       `json:"post"`
		Categories []models.Category `json:"categories"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		req := &request{}
		if err := json.NewDecoder(r.Body).Decode(req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}
		// Get the userId who does the request
		userID := r.Context().Value(ctxUserID).(string)
		// Create category if needed
		for _, category := range req.Categories {
			if err := s.store.Category().Create(&category); err != nil {
				s.error(w, r, http.StatusUnprocessableEntity, err)
				return
			}
		}
		// Create post
		if err := s.store.Post().Create(&req.Post, req.Categories, userID); err != nil {
			s.error(w, r, http.StatusUnprocessableEntity, err)
			return
		}

		s.respond(w, r, http.StatusCreated, request{
			Post:       req.Post,
			Categories: req.Categories,
		})
	}
}

// }}}
// -------------------------REACTION STUFF--------------------------//
// {{{

func (s *server) handleRemoveReaction() http.HandlerFunc {
	type requestBody struct {
		ParentID   string `json:"parent_id"`
		ReactionID string `json:"reaction_id"`
	}

	type responseBody struct {
		Response string `json:"response"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(ctxUserID).(string)

		var req requestBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
		}

		if err := s.store.Reaction().RemoveFromParent(req.ParentID, req.ReactionID, userID); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
		}

		s.respond(w, r, http.StatusAccepted, responseBody{
			Response: "Successfully removed item from db",
		})
	}
}

func (s *server) handleGetReactionsOptions() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		reactions, err := s.store.Reaction().GetAll()
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
		}

		s.respond(w, r, http.StatusFound, reactions)
	}
}

func (s *server) handleGetReactionsByParentID() http.HandlerFunc {
	type requestBody struct {
		ParentID string `json:"parent_id"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		var req requestBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		reactions, err := s.store.Reaction().GetByParentID(req.ParentID)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
		}

		s.respond(w, r, http.StatusFound, reactions)
	}
}

func (s *server) handleGetUserReactions() http.HandlerFunc {
	type requestBody struct {
		ParentID string `json:"parent_id"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(ctxUserID).(string)

		var req requestBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		reactions, err := s.store.Reaction().GetByUserParentID(req.ParentID, userID)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
		}

		s.respond(w, r, http.StatusFound, reactions)
	}
}

func (s *server) handleAddReactionsToParent() http.HandlerFunc {
	type requestBody struct {
		ParentID   string `json:"parent_id"`
		ReactionID string `json:"reaction_id"`
	}

	type responseBody struct {
		Result     string `json:"response"`
		ReactionID string `json:"reaction_id"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(ctxUserID).(string)

		var req requestBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		err := s.store.Reaction().AddToParent(req.ParentID, req.ReactionID, userID)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
		}

		s.respond(w, r, http.StatusCreated, responseBody{
			Result:     "Successfully added to Database",
			ReactionID: req.ReactionID,
		})
	}
}

// }}}
//-------------------------SERVER STUFF--------------------------//
// {{{

func (s *server) serveSinglePostInformation() http.HandlerFunc {
	type requestBody struct {
		Post string `json:"post_id"`
	}

	type commentsBody struct {
		Comment  models.Comment    `json:"comment"`
		Reaction []models.Reaction `json:"reactions"`
	}

	type responseBody struct {
		PostBody    models.Post       `json:"post"`
		CommentBody []commentsBody    `json:"comments"`
		Category    []models.Category `json:"categories"`
		Reactions   []models.Reaction `json:"reactions"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		req := &requestBody{}
		if err := json.NewDecoder(r.Body).Decode(req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}
		post, err := s.store.Post().Get(req.Post)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
		}

		comments, err := s.store.Comment().Get(post.ID)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
		}

		categories, err := s.store.Category().GetForPost(post.ID)

		reactions, err := s.store.Reaction().GetByParentID(post.ID)

		var commentBody commentsBody
		var aLotOfCommentBodies []commentsBody
		for _, comment := range *comments {
			reaction, err := s.store.Reaction().GetByParentID(comment.ID)
			if err != nil {
				s.error(w, r, http.StatusBadRequest, err)
			}

			commentBody.Comment = comment
			commentBody.Reaction = *reaction
			aLotOfCommentBodies = append(aLotOfCommentBodies, commentBody)
		}

		response := responseBody{
			PostBody:    *post,
			CommentBody: aLotOfCommentBodies,
			Category:    *categories,
			Reactions:   *reactions,
		}

		s.respond(w, r, http.StatusCreated, response)
	}
}

func (s *server) handleAllPostInformation() http.HandlerFunc {
	type requestBody struct {
		Index int       `json:"current_index"`
		Time  time.Time `json:"page_open_time_stamp"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// get index from body
		request := &requestBody{}
		if err := json.NewDecoder(r.Body).Decode(request); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		fmt.Println(*request)

		posts, err := s.store.Post().GetFeed(request.Index, 10, request.Time)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		for i, post := range posts {
			commentCount, err := s.store.Post().GetCommentNumber(post.ID)
			if err != nil {
				s.error(w, r, http.StatusBadRequest, err)
				return
			}
			posts[i].CommentCount = commentCount
		}

		fmt.Println(posts)

		s.respond(w, r, http.StatusOK, posts)
	}
}

// }}}
// -------------------------COMMENT STUFF--------------------------//
// {{{
func (s *server) handleCommentCreation() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		c := &models.Comment{}
		if err := json.NewDecoder(r.Body).Decode(c); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}
		userID := r.Context().Value(ctxUserID).(string)
		err := s.store.Comment().Create(c, userID)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
		}
		s.respond(w, r, http.StatusCreated, fmt.Sprintf(`Successfully created comment`))
	}
}

func (s *server) error(w http.ResponseWriter, r *http.Request, code int, err error) {
	s.respond(w, r, code, map[string]string{"error": err.Error()})
}

func (s *server) respond(w http.ResponseWriter, r *http.Request, code int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

//}}}
