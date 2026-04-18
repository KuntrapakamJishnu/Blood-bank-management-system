import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Clock, User } from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const ChatModal = ({ facilityId, facilityName, onClose }) => {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize or get chat thread
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/chat/facility/${facilityId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch chat thread");

        const data = await res.json();
        setThread(data.data);

        // Fetch messages
        await fetchMessages(data.data._id);
      } catch (err) {
        console.error("Chat init error:", err);
        toast.error("Failed to initialize chat");
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      initializeChat();
    }
  }, [facilityId]);

  const fetchMessages = async (threadId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/chat/${threadId}/messages?page=1&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch messages");

      const data = await res.json();
      setMessages(data.data.messages || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !thread) return;

    try {
      setSending(true);

      const res = await fetch(
        `${API_BASE_URL}/api/chat/${thread._id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      // Add message to local state
      setMessages([...messages, data.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 h-96 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-end md:justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full md:w-96 h-96 md:h-[500px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-sm">{facilityName}</h3>
              <p className="text-xs opacity-90">Chat Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-red-700 p-1 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Start conversation</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  msg.sender === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.sender === userId
                      ? "bg-red-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 opacity-70 flex items-center gap-1 ${
                      msg.sender === userId
                        ? "text-red-100"
                        : "text-gray-600"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "now"}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t border-gray-200 p-4 flex gap-2 bg-white rounded-b-lg"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
