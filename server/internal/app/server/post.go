package server

import (
	"encoding/json"
	"net/http"
	"time"

	"forum/server/internal/models"
	"forum/server/pkg/router"
)

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

		req.Post.ImageURL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
		// Create post
		if err := s.store.Post().Create(&req.Post, req.Categories, userID); err != nil {
			s.error(w, r, http.StatusUnprocessableEntity, err)
			return
		}

		s.respond(w, r, http.StatusCreated, Response{
			Message: "Successful",
			Data: request{
				Post:       req.Post,
				Categories: req.Categories,
			},
		})
	}
}

func (s *server) handleRemovePost() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := router.Param(r.Context(), "id")
		if err := s.store.Post().Delete(id); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		s.respond(w, r, http.StatusOK, Response{
			Message: "Successful",
			Data:    nil,
		})
	}
}

func (s *server) serveSinglePostInformation() http.HandlerFunc {
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
		id := router.Param(r.Context(), "id")
		post, err := s.store.Post().Get(id)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		comments, err := s.store.Comment().Get(post.ID)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		categories, err := s.store.Category().GetForPost(post.ID)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		reactions, err := s.store.Reaction().GetByParentID(post.ID)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		var commentBody commentsBody
		var aLotOfCommentBodies []commentsBody
		for _, comment := range *comments {
			reaction, err := s.store.Reaction().GetByParentID(comment.ID)
			if err != nil {
				s.error(w, r, http.StatusBadRequest, err)
				return
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

		s.respond(w, r, http.StatusOK, Response{
			Message: "Successful",
			Data:    response,
		})
	}
}

func (s *server) handleAllPostInformation() http.HandlerFunc {
	type requestBody struct {
		Index      int       `json:"current_index"`
		Time       time.Time `json:"page_open_time_stamp"`
		CategoryID string    `json:"category_id"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// get index from body
		request := &requestBody{}
		if err := json.NewDecoder(r.Body).Decode(request); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		posts, err := s.store.Post().GetFeed(request.Index, 10, request.Time, request.CategoryID)
		if err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}
		type postAndCategory struct {
			Post     models.Post        `json:"post"`
			Category *[]models.Category `json:"categories"`
		}

		var response []postAndCategory
		for i, post := range posts {
			commentCount, err := s.store.Post().GetCommentNumber(post.ID)
			if err != nil {
				s.error(w, r, http.StatusBadRequest, err)
				return
			}
			posts[i].CommentCount = commentCount
			categories, err := s.store.Category().GetForPost(post.ID)
			if err != nil {
				s.error(w, r, http.StatusBadRequest, err)
				return
			}
			response = append(response, postAndCategory{
				Post:     posts[i],
				Category: categories,
			})
		}

		s.respond(w, r, http.StatusOK, Response{
			Message: "Successful",
			Data:    response,
		})
	}
}
