import { StrictMode, createContext, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { supabase } from "./singletonSupabase.js";

import "./index.css";

// ✅ Event Context
const EventContext = createContext();

function EventProvider({ children }) {
  const [eventStarted, setEventStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("event_status")
        .select("started")
        .eq("id", 1)
        .maybeSingle();

      //console.log("Supabase response:", { data, error });

      if (!error && data) {
        //console.log("Updating eventStarted:", data.started, "typeof:", typeof data.started);
        setEventStarted(data.started);
      } else {
        console.log(" Error fetching event status:", error);
      }

      setLoading(false);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // 5 sec 80% save on post 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    //console.log("🟢 eventStarted changed:", eventStarted);
  }, [eventStarted]);

  return (
    <EventContext.Provider value={{ eventStarted, loading }}>
      {children}
    </EventContext.Provider>
  );
}

function useEvent() {
  return useContext(EventContext);
}

// ✅ Pages
import Home from "./pages/home.jsx";
import Start from "./pages/start.jsx"; // <-- start page is now protected
import NotFound from "./pages/NotFound.jsx";
import Backup from "./pages/backup.jsx";
import InternalCommunications from "./pages/internal-communications.jsx";
import Admin from "./pages/admin.jsx";
import Flags from "./pages/Flag.jsx";
import Public from "./pages/Public.jsx";

// ✅ AppRouter with conditional protected routes including /start
function AppRouter() {
  const { eventStarted, loading } = useEvent();

  if (loading) return <p>Loading event status...</p>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="flags" element={<Flags />} />

      {/* Protected routes rendered only when eventStarted is true */}
      {eventStarted && (
        <>
          <Route path="start" element={<Start />} />
          <Route path="backup" element={<Backup />} />
          <Route path="internal-communications" element={<InternalCommunications />} />
          <Route path="admin" element={<Admin />} />
          <Route path="public" element={<Public />} />
        </>
      )}

      {/* Redirect attempts to access protected routes before event */}
      {!eventStarted && (
        <>
          <Route path="start" element={<Navigate to="/" replace />} />
          <Route path="backup" element={<Navigate to="/" replace />} />
          <Route path="internal-communications" element={<Navigate to="/" replace />} />
          <Route path="admin" element={<Navigate to="/" replace />} />
          <Route path="public" element={<Navigate to="/" replace />} />
        </>
      )}

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ✅ Mount
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <EventProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </EventProvider>
  </StrictMode>
);
