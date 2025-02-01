import client, { database, uniqueID } from "../appwriteConfig";
import { useState, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";

const addComment = async (taskId, userId, content) => {
  const tagUser = TaggingUser(content);
  const response = await database.createDocument(
    "67714f2e0006d28825f7",
    "679bba64000e4eda62cf",
    uniqueID.unique(),
    {
      taskId: taskId,
      userId: userId,
      content: content,
      tagUser: tagUser,
      createdTime: new Date().toISOString(),
    }
  );
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
  const addComments = await database.listDocuments(
    "67714f2e0006d28825f7",
    "679bba64000e4eda62cf",
    [`equal("taskId", "${taskId}")`, "orderDesc(createdTime)"]
  );
  return addComments.documents;
};

export const deleteComments = async (documentId) => {
  const response = await database.deleteDocument(
    "67714f2e0006d28825f7",
    "679bba64000e4eda62cf",
    documentId
  );
  return response;
};

const UserComments = ({ taskId, userId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    const data = await retrieveComments(taskId);
    setComments(data);
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComments(documentId);
    }
    setComments(comments.filter((com) => com.$id !== documentId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(taskId, userId, newComment);
    setNewComment("");
    fetchComments();
  };

  return (
    <div className="flex justify-center">
      <div className="bg-blue-50 pb-1 w-3/4 shadow-xl rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="pt-3 pb-2 px-1 flex bg-blue-500 rounded-t-lg rounded-b-md"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="p-2 mr-2 mb-2 ml-2 border rounded-lg flex w-full outline-blue-100"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 mb-2 rounded-lg mt-auto flex mr-2"
          >
            Send <IoIosSend className=" mt-1 ml-1 size-4" />
          </button>
        </form>
        <ul className="mt-3">
          {comments.map((comment) => (
            <li
              key={comment.$id}
              className="bg-white text-gray-500 mx-2 mb-2 rounded-lg shadow-md py-2 px-3 flex items-center"
            >
              <div className="flex items-center flex-grow">
                <strong className="text-black flex items-center mr-2">
                  <FaRegUser className="text-blue-500 mr-1" /> {comment.userId}:
                </strong>
                <span>{comment.content}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleDelete(comment.$id)}
                  className="text-red-500 hover:text-red-700 ml-2 p-2"
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
