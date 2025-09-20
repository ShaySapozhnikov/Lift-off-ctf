import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../singletonSupabase";
import { getUserName } from "../../utils/cookieUser";

function ChatLog() {
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null);
  const currentUserName = getUserName();
  
  // Check if user is scrolled to bottom (with small tolerance)
  const isAtBottom = () => {
    if (!chatBoxRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    return scrollHeight - scrollTop - clientHeight < 10; // 10px tolerance
  };

  // Auto-scroll only if user was already at bottom
  useEffect(() => {
    if (chatBoxRef.current && isAtBottom()) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch messages every 1 second
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (!error && data) {
        setMessages(data);
        console.log("Chat updated");
      }
    };

    // Initial fetch
    fetchMessages();
    // Poll every 1 second
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900 p-4 h-[200px] border-2 border-gray-500 border-dashed rounded-md mt-4 flex flex-col">
      <h1 className="text-center">---Chat Log---</h1>
      <div
        id="chat-box"
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto space-y-2 mt-2"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-left ${
              msg.username === currentUserName ? "text-orange-400" : "text-white"
            }`}
          >
            {msg.username}: {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatLog;