// client/src/components/owner/OwnerChatWrapper.jsx
import { useParams } from "react-router-dom";
import Chat from "../Chat";
import { useAppContext } from "../../context/AppContext";
import { socket } from "../../socket";
import useOwnerNotifications from "../../hooks/useOwnerNotifications";

export default function OwnerChatWrapper() {
  const { bookingId } = useParams();
  const { owner } = useAppContext(); // owner object from context
  useOwnerNotifications(socket); // start listening for notifications (global)

  return <Chat bookingId={bookingId} userName={owner?.name || "Owner"} />;
}
