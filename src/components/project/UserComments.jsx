import client, { database, uniqueID } from "../../services/appwriteClient";
import { useState, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { FaEdit, FaTrashAlt, FaCheck, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notifyMentionedUsers } from "./Notifications";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COMMENT = import.meta.env.VITE_APPWRITE_COMMENT;

const addComment = async (taskId, userId, content) => {
  const tagUser = TaggingUser(content);
  const response = await database.createDocument(
    DATABASE_ID,
    COMMENT,
    uniqueID.unique(),
    {
      taskId: taskId,
      userId: userId,
      content: content,
      tagUser: tagUser,
      createdTime: new Date().toISOString(),
    },
  );

  if (tagUser.length > 0) {
    await notifyMentionedUsers(tagUser, userId, content);
  }

  return response;
};

const TaggingUser = (text) => {
  const tagsExpression = /@(\w+)/g;
  const tags = text.match(tagsExpression);
  if (tags) {
    return tags.map((m) => m.replace("@", ""));
  } else {
    return [];
  }
};

export const retrieveComments = async (taskId) => {
  const addComments = await database.listDocuments(DATABASE_ID, COMMENT, [
    Query.equal("taskId", taskId),
    Query.orderDesc("createdTime"),
  ]);
  return addComments.documents;
};

export const deleteComments = async (documentId) => {
  const response = await database.deleteDocument(
    DATABASE_ID,
    COMMENT,
    documentId,
  );
  return response;
};

export const editComments = async (documentId, updatedContent) => {
  const response = await database.updateDocument(
    DATABASE_ID,
    COMMENT,
    documentId,
    {
      content: updatedContent,
    },
  );
  return response;
};

const UserComments = ({ taskId, userId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editComment, setEditComment] = useState(null);
  const [editedComment, setEditedComment] = useState("");

  useEffect(() => {
    if (!taskId) return;

    fetchComments();

    const channel = `databases.${DATABASE_ID}.collections.${COMMENT}.documents`;

    const unsubscribe = client.subscribe(channel, (response) => {
      console.log("Real-time event received:", response);

      if (
        response.events.includes("databases.*.collections.*.documents.*.create")
      ) {
        setComments((prev) => [response.payload, ...prev]);
        toast.success("New comment added!");
      }

      if (
        response.events.includes("databases.*.collections.*.documents.*.update")
      ) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.$id === response.payload.$id ? response.payload : comment,
          ),
        );
        toast.info("Comment edited");
      }

      if (
        response.events.includes("databases.*.collections.*.documents.*.delete")
      ) {
        setComments((prev) =>
          prev.filter((comment) => comment.$id !== response.payload.$id),
        );
        toast.error("Comment deleted");
      }
    });

    return () => unsubscribe();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const data = await retrieveComments(taskId);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleEditClick = (comment) => {
    setEditComment(comment.$id);
    setEditedComment(comment.content);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (documentId) => {
    if (!editedComment.trim()) return;
    setIsSaving(true);
    await editComments(documentId, editedComment);
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.$id === documentId) {
          return { ...comment, content: editedComment };
        } else {
          return comment;
        }
      }),
    );
    setEditComment(null);
    setIsSaving(false);
  };

  const handleDelete = async (documentId) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (userConfirmed) {
      await deleteComments(documentId);
      setComments(comments.filter((com) => com.$id !== documentId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(taskId, userId, newComment);
    setNewComment("");
  };

  return (
    <div className="flex justify-center mt-6">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl border border-gray-100">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-4 border-b bg-gray-50 rounded-t-2xl"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />

          <button
            type="submit"
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition"
          >
            Send <IoIosSend className="text-sm" />
          </button>
        </form>

        <ul className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {comments.map((comment) => (
            <li
              key={comment.$id}
              className="bg-gray-50 hover:bg-gray-100 transition rounded-xl p-3 shadow-sm flex justify-between items-start"
            >
              <div className="flex gap-3 flex-grow">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FaRegUser />
                </div>

                <div className="flex flex-col w-full">
                  <span className="text-sm font-semibold text-gray-800">
                    {comment.userId}
                  </span>

                  {editComment === comment.$id ? (
                    <input
                      type="text"
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      className="mt-1 px-2 py-1 border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <span className="text-sm text-gray-600 mt-1 break-words">
                      {comment.content}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                {editComment === comment.$id ? (
                  <>
                    {isSaving ? (
                      <LoadingSpinner />
                    ) : (
                      <button
                        onClick={() => handleSave(comment.$id)}
                        className="text-green-500 hover:bg-green-100 p-2 rounded-md transition"
                      >
                        <FaCheck />
                      </button>
                    )}

                    <button
                      onClick={() => setEditComment(null)}
                      className="text-gray-500 hover:bg-gray-200 p-2 rounded-md transition"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditClick(comment)}
                    className="text-orange-500 hover:bg-orange-100 p-2 rounded-md transition"
                  >
                    <FaEdit />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(comment.$id)}
                  className="text-red-500 hover:bg-red-100 p-2 rounded-md transition"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserComments;
