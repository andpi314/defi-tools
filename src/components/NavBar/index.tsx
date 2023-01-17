import { Link } from "react-router-dom";
import { routes } from "../../router";

export default function NavBar() {
  return (
    <div style={{ display: "flex", width: "100%" }}>
      {routes.map((route) => (
        <Link
          key={route.path}
          style={{
            display: "block",
            flex: 1,
            textAlign: "center",
            color: "black",
            textDecoration: "none",
          }}
          to={route.path}
        >
          {route.label}
        </Link>
      ))}
    </div>
  );
}
