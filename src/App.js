import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Auth, Home, Login, Dashboard, NotAuthorized, NotFound, Register, ManajemenData, ManajemenDataInput, ManajemenDataInputPhase2, ManajemenDataInputPhase3, Simulasi, SimulasiMap, ConfirmByCode, ResentEmailConfirmation, ForgotPassword, ResetPassword, UserManagement, UserManagementEdit, RoleManagement, RoleManagementEdit, RoleManagementCreate, UserManagementCreate, Profile, ProfileEdit, Report } from "./pages";

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
          <Route path="/confirm" component={ConfirmByCode} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/forgotpassword" component={ForgotPassword} />
          <Route path="/reset/password" component={ResetPassword} />
          <Route path="/manajemendata" component={ManajemenData} />
          <Route path="/manajemendatainput/kebutuhandata" component={ManajemenDataInputPhase2} />
          <Route path="/manajemendatainput/uploaddata" component={ManajemenDataInputPhase3} />
          <Route path="/manajemendatainput" component={ManajemenDataInput} />
          <Route path="/simulasi" component={Simulasi} />
          <Route path="/simulasimap" component={SimulasiMap} />
          <Route path="/resentmailconfirmation" component={ResentEmailConfirmation} />
          <Route path="/usermanagement/create" component={UserManagementCreate} />
          <Route path="/usermanagement/edit" render={props => <UserManagementEdit {...props}/>} />
          <Route path="/usermanagement" component={UserManagement} />
          <Route path="/rolemanagement/create" component={RoleManagementCreate} />
          <Route path="/rolemanagement/edit" component={RoleManagementEdit} />
          <Route path="/rolemanagement" component={RoleManagement} />
          <Route path="/profile/edit" component={ProfileEdit} />
          <Route path="/profile" component={Profile} />
          <Route path="/report" component={Report} />
          <Route path="/not-authorized" component={NotAuthorized} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
