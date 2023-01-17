import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import TradingReturn from "../components/TradingReturn";
import Home from "../pages/Home";
import PathViewer from "../pages/PathViewer";
import UniswapFee from "../pages/UniswapFee";
// import UniswapHedge from "../pages/UniswapHedge/index.tsx.disabled";
import "../styles.css";

export enum Paths {
  UniswapFee = "/",
  Home = "/home",
  PathViewer = "/path",
  TradingReturn = "/trading-return",
}

export const routes = [
  {
    path: Paths.UniswapFee,
    label: "Uniswap Fee",
    component: <UniswapFee />,
  },
  {
    path: Paths.Home,
    label: "Home",
    component: <Home />,
  },
  {
    path: Paths.PathViewer,
    label: "Path Viewer",
    component: <PathViewer />,
  },
  {
    path: Paths.TradingReturn,
    label: "Treading Return",
    component: <TradingReturn />,
  },
];

export default function Routing() {
  // https://reactrouter.com/en/main/upgrading/v5
  return (
    <Router>
      <NavBar />
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Router>
  );
}
