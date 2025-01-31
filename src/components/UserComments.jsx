import client, { database, uniqueID } from "../appwriteConfig";
import { useState, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";

const comment = async (taskId, userId, content) => {
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
  const response = await database.listDocuments(
    "67714f2e0006d28825f7",
    "679bba64000e4eda62cf",
    [`equal("taskId", "${taskId}")`, "orderDesc(createdTime)"]
  );
  return response.documents;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await comment(taskId, userId, newComment);
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
              className="bg-white ml-2 mr-2 mb-2 rounded-lg text-gray-500 py-2 flex"
            >
              <strong className="text-black ml-2 flex mr-1">
                <FaRegUser className="text-blue-500 mr-1 mt-1" />{" "}
                {comment.userId}:
              </strong>{" "}
              {comment.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserComments;
