import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import PathViewer from "../pages/PathViewer";
import UniswapHedge from "../pages/UniswapHedge";
import "../styles.css";

export default function Routing() {
  // https://reactrouter.com/en/main/upgrading/v5
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UniswapHedge />} />
        <Route path="/home" element={<Home />} />
        <Route path="/path" element={<PathViewer />} />
      </Routes>
    </Router>
  );
}
