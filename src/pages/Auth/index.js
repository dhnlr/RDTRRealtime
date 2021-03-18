import React, { useEffect } from "react";
import { useHistory, Link } from "react-router-dom";

function Auth() {
  let history = useHistory();
  useEffect(() => {
    history.push("/home");
  }, [history]);
  return <div></div>;
}

export default Auth;
