import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Home, Login, NotAuthorized, NotFound } from "./pages";

function App() {
  return (
    <Router basename="/app/">
      {/* <Router basename="/app"> */}
      <div>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/not-authorized" component={NotAuthorized} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
