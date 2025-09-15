// client/src/components/ChatWrapper.jsx
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Chat from "./Chat";

export default function ChatWrapper() {
  const { bookingId } = useParams();
  const { user } = useAppContext(); // ensure user available in context
  return <Chat bookingId={bookingId} userName={user?.name || "Guest"} />;
}
