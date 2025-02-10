import client, { database, uniqueID, account } from "../appwriteConfig";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const notifyMentionedUsers = async (tagUsernames, senderId, message) => {
  console.log("Tagging users:", tagUsernames);
  try {
    // 🔍 Get the current logged-in user's details
    const currentUser = await account.get();
    const currentUserEmail = currentUser.name;

    console.log("Current user:", currentUser); // ✅ Log the current user's info

    // Check if the current user is mentioned
    if (tagUsernames.includes(currentUserEmail)) {
      // Create a notification

      console.log("Mentioned user detected:", currentUser.name); // ✅ Log if a mention is detected

      await database.createDocument(
        "67714f2e0006d28825f7",
        "67a921e600233491b213",
        uniqueID.unique(),
        {
          recipientId: currentUser.$id,
          senderId: senderId,
          message: `@${currentUserEmail}, you were mentioned in a comment: "${message}"`,
          createdAt: new Date().toISOString(),
          isRead: false,
        }
      );

      console.log(`Notification sent to @${currentUserEmail}`);
    } else {
      console.log("No mentioned user found for the current user.");
    }
  } catch (error) {
    console.error("Error notifying mentioned users:", error);
  }
};

export const Notifications = ({ recipientId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications(recipientId); // Fetch all notifications for the user
      setNotifications(data);
    };

    loadNotifications();

    // Real-time subscription
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

  return (
    <div className=" bg-white border rounded-lg flex flex-col items-center justify-center p-3 max-w-md mx-auto hover:bg-gray-100">
      <button className="text-blue-600">
        <div className="relative inline-block">
          <FaBell className="text-2xl" />
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2 rounded-full text-xs">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </div>
      </button>
      <div className="bg-white shadow-lg rounded-md w-40 p-3 mt-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No new notifications</p>
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
                    onClick={() => markNotificationAsRead(note.$id)}
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    Mark as Read
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

const markNotificationAsRead = async (notificationId) => {
  try {
    await database.updateDocument(
      "67714f2e0006d28825f7",
      "67a921e600233491b213",
      notificationId,
      { isRead: true }
    );

    console.log("Notification marked as read");
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

export default Notifications;
