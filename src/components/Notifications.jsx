import client, { database, uniqueID } from "../appwriteConfig";
import { useEffect, useMemo, useState } from "react";
import { FaBell } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const NOTIFICATIONS_COLLECTION_ID = import.meta.env
  .VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID;

const userMapping = {
  ilia: "6769fe87003164c5646a",
  geri: "676daad3d1bdb988bad3",
  thanie: "679a76a9001574e7ffff",
};

const removeNotification = async (notificationId) => {
  return await database.deleteDocument(
    DATABASE_ID,
    NOTIFICATIONS_COLLECTION_ID,
    notificationId
  );
};

export const notifyMentionedUsers = async (tagUsernames, senderId, message) => {
  const userIds = tagUsernames
    .map((username) => userMapping[username])
    .filter(Boolean);

  const uniqueRecipientIds = [...new Set(userIds)];

  for (const recipientId of uniqueRecipientIds) {
    try {
      await database.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        uniqueID.unique(),
        {
          recipientId,
          senderId,
          message: `You were mentioned in a comment: "${message}"`,
          createdAt: new Date().toISOString(),
          isRead: false,
        }
      );
    } catch (error) {
      console.error("Failed to notify user:", recipientId, error);
    }
  }
};

const fetchNotifications = async (recipientId) => {
  try {
    const response = await database.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [Query.equal("recipientId", recipientId)]
    );

    return response.documents ?? [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const Notifications = ({ recipientId }) => {
  const [notifications, setNotifications] = useState([]);

  const channel = useMemo(
    () =>
      `databases.${DATABASE_ID}.collections.${NOTIFICATIONS_COLLECTION_ID}.documents`,
    []
  );

  useEffect(() => {
    if (!recipientId) return;

    let alive = true;

    const loadNotifications = async () => {
      const data = await fetchNotifications(recipientId);
      if (alive) setNotifications(data);
    };

    loadNotifications();

    const unsubscribe = client.subscribe(channel, (response) => {
      const eventType = response?.events?.[0] ?? "";
      const notification = response?.payload;

      if (!notification) return;

      if (eventType.includes("create")) {
        if (notification.recipientId === recipientId) {
          setNotifications((prev) => [notification, ...prev]);
          toast.info(notification.message, { icon: "🔔" });
        }
      }
    });

    return () => {
      alive = false;
      try {
        unsubscribe?.();
      } catch {}
    };
  }, [recipientId, channel]);

  const unreadCount = notifications.reduce(
    (count, n) => count + (!n.isRead ? 1 : 0),
    0
  );

  const handleDelete = async (notificationId) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );
    if (!userConfirmed) return;

    try {
      await removeNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));
      toast.error("Notification deleted 🗑️");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification.");
    }
  };

  return (
    <div
      className="bg-white border rounded-lg flex flex-col items-center p-4 max-w-md mx-auto hover:bg-gray-100 overflow-auto"
      style={{ height: "300px" }}
    >
      <ToastContainer position="bottom-right" autoClose={3000} />

      <button className="text-blue-500" type="button">
        <div className="relative flex">
          <p className="mb-4 text-lg text-blue-500 font-semibold">
            Notifications
          </p>

          <FaBell className="ml-2 mt-1 text-lg" />

          {unreadCount > 0 && (
            <span className="absolute top-2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2 rounded-full text-xs">
              {unreadCount}
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
                    type="button"
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
