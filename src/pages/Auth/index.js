import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

function Auth() {
  let history = useHistory();
  useEffect(() => {
    history.push("/home");
  }, [history]);
  return <div></div>;
}

export default Auth;
