import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "quill/dist/quill.snow.css";
import "./index.css";
import App from "./App";
import { store } from "./redux/store/store";
import { verifyAuth } from "./redux/slice/authSlice";

const Bootstrap = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) dispatch(verifyAuth());
  }, [dispatch]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <Bootstrap>
        <ToastContainer />
        <App />
      </Bootstrap>
    </Provider>
  </BrowserRouter>
);
