import client, { database, uniqueID } from "../appwriteConfig";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Query } from "appwrite";

//HardCoding Data for Now
const userMapping = {
  ilia: "6769fe87003164c5646a",
  geri: "676daad3d1bdb988bad3",
  Thanie: "679a76a9001574e7ffff",
};

const removeNotification = async (notificationId) => {
  const response = await database.deleteDocument(
    "67714f2e0006d28825f7",
    "67a921e600233491b213",
    notificationId
  );

  return response;
};

export const notifyMentionedUsers = async (tagUsernames, senderId, message) => {
  const userIds = tagUsernames
    .map((username) => userMapping[username])
    .filter((id) => id);

  for (const recipientId of userIds) {
    await database.createDocument(
      "67714f2e0006d28825f7",
      "67a921e600233491b213",
      uniqueID.unique(),
      {
        recipientId: recipientId,
        senderId: senderId,
        message: `You were mentioned in a comment: "${message}"`,
        createdAt: new Date().toISOString(),
        isRead: false,
      }
    );
  }
};

const fetchNotifications = async (recipientId) => {
  try {
    const response = await database.listDocuments(
      "67714f2e0006d28825f7",
      "67a921e600233491b213",
      [Query.equal("recipientId", recipientId)]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const Notifications = ({ recipientId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications(recipientId);
      setNotifications(data);
    };

    loadNotifications();

    const channel = `databases.67714f2e0006d28825f7.collections.67a921e600233491b213.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      if (
        response.events.includes("databases.*.collections.*.documents.*.create")
      ) {
        const notification = response.payload;
        if (notification.recipientId === recipientId) {
          setNotifications((prev) => [notification, ...prev]);
          toast.info(notification.message, { icon: "🔔" });
        }
      }
    });

    return () => unsubscribe();
  }, [recipientId]);

  const handleDelete = async (notificationsId) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (userConfirmed) {
      await removeNotification(notificationsId);
      setNotifications(
        notifications.filter((noti) => noti.$id !== notificationsId)
      );
      toast.error("Comment deleted 🗑️");
    }
  };

  return (
    <div
      className="bg-white border rounded-lg flex flex-col items-center p-4 max-w-md mx-auto hover:bg-gray-100 overflow-auto"
      style={{ height: "300px" }}
    >
      <ToastContainer position="bottom-right" autoClose={3000} />
      <button className="text-blue-500">
        <div className="relative flex">
          <p className="mb-4 text-lg text-blue-500 font-semibold">
            Notifications
          </p>
          <FaBell className="ml-2 mt-1 text-lg" />
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="absolute top-2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2 rounded-full text-xs">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </div>
      </button>
      <div
        className="bg-white shadow-lg rounded-md w-40 p-3 mt-2"
        style={{ height: "300px", overflowY: "auto" }}
      >
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm flex items-center">
            No Notifications
          </p>
        ) : (
          <ul>
            {notifications.map((note) => (
              <li
                key={note.$id}
                className={`text-sm text-gray-700 border-b p-2 ${
                  note.isRead ? "opacity-50" : ""
                }`}
              >
                {note.message}
                {!note.isRead && (
                  <button
                    onClick={() => handleDelete(note.$id)}
                    className="mt-2 text-red-500 hover:underline"
                  >
                    Delete Notification
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
