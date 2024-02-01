package server

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"forum/server/internal/store"
	"forum/server/pkg/jwttoken"
	"forum/server/pkg/router"
	"forum/server/pkg/websocket"
)

const (
	sessionName     = "session"
	jwtKey          = "JWT_KEY"
	ctxKeyRequestID = iota
	ctxUserID
)

type server struct {
	websocket *websocket.WebSocket
	router    *router.Router
	logger    *log.Logger
	store     store.Store
}

func newServer(store store.Store) *server {
	s := &server{
		websocket: websocket.NewWebSocket(),
		router:    router.NewRouter(),
		logger:    log.Default(),
		store:     store,
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

	// -------------------- USER PATHS ------------------------------- //
	s.router.HandleFunc("GET", "/api/v1/jwt/users", s.handleUsersGetAll())
	s.router.HandleFunc("GET", "/api/v1/jwt/users/:id", s.handleUsersGetByID())
	s.router.HandleFunc("DELETE", "/api/v1/jwt/users/delete/:id", s.handleUsersDelete())
	// -------------------- CATEGORY PATHS --------------------------- //
	s.router.HandleFunc("GET", "/api/v1/jwt/categories", s.handleGetAllCategories())
	// -------------------- POST PATHS ------------------------------- //
	s.router.HandleFunc("POST", "/api/v1/jwt/posts", s.handleAllPostInformation())
	s.router.HandleFunc("POST", "/api/v1/jwt/posts/create", s.handlePostCreation())
	s.router.HandleFunc("GET", "/api/v1/jwt/posts/:id", s.serveSinglePostInformation())
	s.router.HandleFunc("DELETE", "/api/v1/jwt/posts/delete/:id", s.handleRemovePost())
	// -------------------- COMMENT PATHS ---------------------------- //
	s.router.HandleFunc("POST", "/api/v1/jwt/comments/create", s.handleCommentCreation())
	s.router.HandleFunc("DELETE", "/api/v1/jwt/comments/delete/:id", s.handleRemoveComment())
	// -------------------- CHAT PATHS ------------------------------- //
	s.router.HandleFunc("POST", "/api/v1/jwt/chat/:user_id", s.handleCreateChat())
	s.router.HandleFunc("POST", "/api/v1/jwt/chat/line/create", s.handleWriteLines())
	s.router.HandleFunc("POST", "/api/v1/jwt/chat/line/init", s.handleInitChatLines())

	// -------------------- REACTION PATHS --------------------------- //
	s.router.HandleFunc("GET", "/api/v1/jwt/reactions/getAll", s.handleGetReactions())
	s.router.HandleFunc("POST", "/api/v1/jwt/reactions/remove", s.handleRemoveReaction())
	s.router.HandleFunc("POST", "/api/v1/jwt/reactions/addToParent", s.handleAddReactionsToParent())
	s.router.HandleFunc("GET", "/api/v1/jwt/reactions/getByUserParentID", s.handleGetUserReactions())
	s.router.HandleFunc("GET", "/api/v1/jwt/reactions/getByParentID", s.handleGetReactionsByParentID())

	//s.router.UseWithPrefix("/jwt", s.jwtMiddleware)
	s.router.HandleFunc("GET", "/jwt/chat", s.wsHandler())
	// EXAMPLE OF DYNAMIC PATH
	// s.router.HandleFunc("GET", "/api/v1/jwt/users/:test", s.handleTest())
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *server) wsHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rw := &responseWriter{w, http.StatusOK}
		//user_id := router.Param(r.Context(), "user_id")
		userId := r.Context().Value(ctxUserID).(string)
		if err := s.websocket.HandleWebSocket(rw, r, userId); err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
		}
	}
}

func (s *server) handleCheckCookie() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(sessionName)
		if err != nil {
			s.error(w, r, http.StatusUnauthorized, err)
			return
		}

		alg := jwttoken.HmacSha256(os.Getenv(jwtKey))
		claims, err := alg.DecodeAndValidate(cookie.Value)
		if err != nil {
			s.error(w, r, http.StatusUnauthorized, err)
			return
		}
		// check if user exist
		_, err = s.store.User().FindByID(claims.UserID)
		if err != nil {
			deletedCookie := s.deleteCookie()
			http.SetCookie(w, &deletedCookie)
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		s.respond(w, r, http.StatusOK, Response{
			Message: "Successful",
			Data:    claims.UserID,
		})
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

func (s *server) deleteCookie() http.Cookie {
	deletedCookie := http.Cookie{
		Name:     sessionName,
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
	return deletedCookie
}
