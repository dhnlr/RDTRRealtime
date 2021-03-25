import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Auth, Home, Login, Dashboard, NotAuthorized, NotFound, Register, Simulasi, SimulasiManajemenData, SimulasiManajemenDataPhase2, SimulasiManajemenDataPhase3 } from "./pages";

function App() {
  return (
    <Router basename="/rdtrrealtime/">
      {/* <Router basename="/app"> */}
      <div>
        <Switch>
          <Route exact path="/" component={Auth} />
          <Route path="/home" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/simulasi" component={Simulasi} />
          <Route path="/simulasimanajemendata/kebutuhandata" component={SimulasiManajemenDataPhase2} />
          <Route path="/simulasimanajemendata/uploaddata" component={SimulasiManajemenDataPhase3} />
          <Route path="/simulasimanajemendata" component={SimulasiManajemenData} />
          <Route path="/not-authorized" component={NotAuthorized} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
