import { useUserRole, canEdit } from '../../hooks/useUserRole';

// Inside CommentSection component
const userRole = useUserRole(loop);

// Update comment actions to check permissions
{canEdit(userRole) && comment.createdBy === user?.uid && (
  <div className="relative">
    <button
      onClick={() => setShowActionsFor(showActionsFor === comment.id ? null : comment.id)}
      className="p-1 hover:bg-gray-100 rounded-full"
    >
      <MoreVertical className="w-4 h-4 text-gray-400" />
    </button>
    {showActionsFor === comment.id && (
      <CommentActions
        comment={comment}
        onEdit={() => {
          setEditingComment(comment.id);
          setEditContent(comment.content);
          setShowActionsFor(null);
        }}
        onDelete={() => {
          handleDelete(comment.id);
          setShowActionsFor(null);
        }}
      />
    )}
  </div>
)}

// Only allow adding comments for editors and owners
{canEdit(userRole) && (
  <form onSubmit={handleSubmit} className="flex space-x-2">
    <input
      type="text"
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Add a comment..."
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      disabled={loading}
    />
    <button
      type="submit"
      disabled={!newComment.trim() || loading}
      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      <Send className="w-5 h-5" />
    </button>
  </form>
)}