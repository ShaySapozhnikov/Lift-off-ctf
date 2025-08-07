import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter,RouterProvider,} from "react-router-dom"; 


import "./index.css";
import Home from "./pages/home.jsx";
import NotFound from "./pages/NotFound.jsx";
import Start from "./pages/start.jsx";
import Backup from "./pages/backup.jsx";
import InternalCommunications from "./pages/internal-communications.jsx";
import Admin from "./pages/admin.jsx";

const router = createBrowserRouter([
  {path: "*", element: <NotFound />}, // needs btter ui!!
  { path: "/", element: <Home /> },
  {path:"start" , element: <Start />},
  {path: "backup" , element: <Backup />},
  {path: "internal-communications", element: <InternalCommunications />},
  {path: "admin" , element: <Admin /> }

]);



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
