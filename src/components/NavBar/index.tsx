import { Link, useLocation } from "react-router-dom";
import { routes, Paths } from "../../router";

export default function NavBar() {
  const location = useLocation();
  const pathname = location.pathname as Paths;
  return (
    <div
      style={{
        display: "flex",
        maxWidth: "100vw",
        marginBottom: 32,
        padding: 16,
      }}
    >
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
          <span
            style={{
              paddingBottom: 4,

              ...(pathname === route.path && {
                fontWeight: 600,
                borderBottom: "1px solid black",
              }),
            }}
          >
            {route.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
