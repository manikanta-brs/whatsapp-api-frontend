import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import TemplatesList from "./pages/TemplateList.jsx";
import SendMessageForm from "./pages/SendMessage.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/templates",
      element: <TemplatesList />,
    },
    {
      path: "/sendmessage",
      element: <SendMessageForm />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
