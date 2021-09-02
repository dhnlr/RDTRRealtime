import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Auth, Home, Login, Dashboard, NotAuthorized, NotFound, Register, DataManagementInput, DataManagementInputPhase2, SimulasiMap, ConfirmByCode, ResentEmailConfirmation, ForgotPassword, ResetPassword, UserManagement, UserManagementEdit, RoleManagement, RoleManagementEdit, RoleManagementCreate, UserManagementCreate, Profile, ProfileEdit, Report, HelpManagement, HelpManagementCreate, HelpManagementEdit, HelpData, HelpDataFaq, DataManagement, DataManagementInputWater, DataManagementInputTrash, DataManagementInputFlood, DataManagementInputCongestion, DataManagementInputKdb, SimulationTable, SimulationInput, SimulationHistory } from "./pages";

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
          <Route path="/datamanagement" component={DataManagement} />
          <Route path="/datamanagementinput/kebutuhandata" component={DataManagementInputPhase2} />
          <Route path="/datamanagementinput/kdbklb" component={DataManagementInputKdb} />
          <Route path="/datamanagementinput/water" component={DataManagementInputWater} />
          <Route path="/datamanagementinput/trash" component={DataManagementInputTrash} />
          <Route path="/datamanagementinput/flood" component={DataManagementInputFlood} />
          <Route path="/datamanagementinput/congestion" component={DataManagementInputCongestion} />
          <Route path="/datamanagementinput" component={DataManagementInput} />
          <Route path="/schenario" component={SimulationTable} />
          <Route path="/schenariomap" component={SimulasiMap} />
          <Route path="/schenarioinput" component={SimulationInput} />
          <Route path="/schenariohistory" component={SimulationHistory} />
          <Route path="/resentmailconfirmation" component={ResentEmailConfirmation} />
          <Route path="/usermanagement/create" component={UserManagementCreate} />
          <Route path="/usermanagement/edit" render={props => <UserManagementEdit {...props}/>} />
          <Route path="/usermanagement" component={UserManagement} />
          <Route path="/rolemanagement/create" component={RoleManagementCreate} />
          <Route path="/rolemanagement/edit" component={RoleManagementEdit} />
          <Route path="/rolemanagement" component={RoleManagement} />
          <Route path="/helpmanagement/create" component={HelpManagementCreate} />
          <Route path="/helpmanagement/edit" component={HelpManagementEdit} />
          <Route path="/helpmanagement" component={HelpManagement} />
          <Route path="/help/faq" component={HelpDataFaq} />
          <Route path="/help" component={HelpData} />
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
