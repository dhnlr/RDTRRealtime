import Cookies from "js-cookie";
import { Redirect, Route } from "react-router";

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) => {
        return Cookies.get("token") !== null && Cookies.get("token") !== "" && Cookies.get("token") ? (
          children
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: location } }} />
        );
      }}
    ></Route>
  );
}

export default PrivateRoute
