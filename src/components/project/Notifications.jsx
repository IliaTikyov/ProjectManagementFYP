import client, { database, uniqueID } from "../../services/appwriteClient";
import { useEffect, useMemo, useState } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
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
    notificationId,
  );
};

const markAsRead = async (notificationId) => {
  return await database.updateDocument(
    DATABASE_ID,
    NOTIFICATIONS_COLLECTION_ID,
    notificationId,
    { isRead: true },
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
        },
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
      [Query.equal("recipientId", recipientId)],
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
    [],
  );

  useEffect(() => {
    if (!recipientId) return;
    let alive = true;

    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications(recipientId);
        if (alive)
          setNotifications(
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          );
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    loadNotifications();

    const unsubscribe = client.subscribe(channel, (response) => {
      const eventType = response?.events?.[0] ?? "";
      const notification = response?.payload;

      if (!notification) return;

      if (
        eventType.includes("create") &&
        notification.recipientId === recipientId
      ) {
        setNotifications((prev) => [notification, ...prev]);
        toast.info(notification.message, { icon: <FaBell /> });
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
    0,
  );

  const handleDelete = async (notificationId) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );
    if (!userConfirmed) return;

    try {
      await removeNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));
      toast.error("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification.");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.$id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      toast.success("Marked as read");
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark as read.");
    }
  };

  return (
    <div className="bg-white border rounded-lg flex flex-col max-w-md mx-auto p-4 shadow-md">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
      />

      <div className="flex items-center justify-between mb-3">
        <p className="text-lg font-semibold text-blue-500">Notifications</p>
        <div className="relative">
          <FaBell className="text-xl text-blue-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <ul className="overflow-y-auto max-h-[350px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 mt-10">
            <FaBell className="text-4xl mb-2" />
            <p>No Notifications</p>
          </div>
        ) : (
          notifications.map((note) => (
            <li
              key={note.$id}
              className={`p-3 mb-2 rounded-lg shadow-sm flex justify-between items-start transition hover:bg-gray-50 ${
                note.isRead ? "bg-gray-50 opacity-70" : "bg-white"
              }`}
            >
              <div>
                <p className="text-sm text-gray-700">{note.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-end">
                {!note.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(note.$id)}
                    className="text-green-500 hover:underline text-xs mb-1 flex items-center gap-1"
                  >
                    <FaCheck /> Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(note.$id)}
                  className="text-red-500 hover:underline text-xs"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Notifications;
