import React, { useState, useEffect } from 'react'
import { userAPI } from '../../../../services/userApi'
import { MessageCircle, Reply, Edit, Trash2, Send, X, User } from 'lucide-react'
import { getImageUrl } from '../../../common/ImageURL'

const LessonComments = ({ lessonId, lessonName }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (lessonId) {
      loadComments()
    }
  }, [lessonId])

  const loadComments = async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      setError('')
      const response = await userAPI.getLessonComments(lessonId, pageNum)
      
      if (append) {
        setComments(prev => [...prev, ...response.comments])
      } else {
        setComments(response.comments)
      }
      
      setHasMore(pageNum < response.total_pages)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load comments')
      console.error('Error loading comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setLoading(true)
      const response = await userAPI.createLessonComment(lessonId, newComment.trim())
      
      // Add new comment to the beginning of the list
      setComments(prev => [response, ...prev])
      setNewComment('')
      setReplyingTo(null)
    } catch (err) {
      setError('Failed to post comment')
      console.error('Error posting comment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setLoading(true)
      const response = await userAPI.createLessonComment(lessonId, newComment.trim(), replyingTo.id)
      
      // Find the parent comment and add the reply
      setComments(prev => prev.map(comment => {
        if (comment.id === replyingTo.id) {
          return {
            ...comment,
            replies: [...comment.replies, response]
          }
        }
        return comment
      }))
      
      setNewComment('')
      setReplyingTo(null)
    } catch (err) {
      setError('Failed to post reply')
      console.error('Error posting reply:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async (e) => {
    e.preventDefault()
    if (!editContent.trim()) return

    try {
      setLoading(true)
      const response = await userAPI.updateLessonComment(editingComment.id, editContent.trim())
      
      // Update the comment in the list
      setComments(prev => prev.map(comment => {
        if (comment.id === editingComment.id) {
          return { ...comment, ...response }
        }
        return comment
      }))
      
      setEditingComment(null)
      setEditContent('')
    } catch (err) {
      setError('Failed to update comment')
      console.error('Error updating comment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      setLoading(true)
      await userAPI.deleteLessonComment(commentId)
      
      // Remove the comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (err) {
      setError('Failed to delete comment')
      console.error('Error deleting comment:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {comment.user_profile_picture ? (
            <img 
              src={getImageUrl(comment.user_profile_picture)} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {comment.user_firstname} {comment.user_lastname}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          
          {editingComment?.id === comment.id ? (
            <form onSubmit={handleEditComment} className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Edit your comment..."
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingComment(null)
                    setEditContent('')
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-gray-700 mb-2">
              {comment.content}
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment)}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
            
            {comment.user_id === parseInt(localStorage.getItem('userId')) && (
              <>
                <button
                  onClick={() => {
                    setEditingComment(comment)
                    setEditContent(comment.content)
                  }}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
          
          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments for {lessonName}
        </h3>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this lesson..."
            className="flex-1 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Reply form */}
      {replyingTo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              Replying to {replyingTo.user_firstname} {replyingTo.user_lastname}
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmitReply} className="flex space-x-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your reply..."
              className="flex-1 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* Load more button */}
      {hasMore && comments.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => loadComments(page + 1, true)}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More Comments'}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && comments.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading comments...</p>
        </div>
      )}
    </div>
  )
}

export default LessonComments



