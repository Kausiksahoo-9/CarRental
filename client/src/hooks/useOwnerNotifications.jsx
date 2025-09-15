// client/src/hooks/useOwnerNotifications.js
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const useOwnerNotifications = (socket) => {
  const { setUnreadCount, showNotification } = useAppContext();

  useEffect(() => {
    if (!socket || typeof socket.on !== "function") return;

    socket.on("newMessageNotification", (data) => {
      // 🔔 Show toast
      showNotification(`New message from ${data.sender}: ${data.preview}`);
      // 📈 Increment unread count safely
      setUnreadCount((prev) => prev + 1);
    });

    // Cleanup listener on unmount or socket change
    return () => socket.off("newMessageNotification");
  }, [socket, setUnreadCount, showNotification]);
};

export default useOwnerNotifications;
