import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Auth, Home, Login, Dashboard, NotAuthorized, NotFound, Register, ManajemenData, ManajemenDataInput, ManajemenDataInputPhase2, ManajemenDataInputPhase3, Simulasi, SimulasiMap } from "./pages";

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
          <Route path="/manajemendata" component={ManajemenData} />
          <Route path="/manajemendatainput/kebutuhandata" component={ManajemenDataInputPhase2} />
          <Route path="/manajemendatainput/uploaddata" component={ManajemenDataInputPhase3} />
          <Route path="/manajemendatainput" component={ManajemenDataInput} />
          <Route path="/simulasi" component={Simulasi} />
          <Route path="/simulasimap" component={SimulasiMap} />
          <Route path="/not-authorized" component={NotAuthorized} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
