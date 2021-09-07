import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  Auth,
  Home,
  Login,
  Dashboard,
  NotAuthorized,
  NotFound,
  Register,
  DataManagementInput,
  DataManagementInputPhase2,
  SimulasiMap,
  ConfirmByCode,
  ResentEmailConfirmation,
  ForgotPassword,
  ResetPassword,
  UserManagement,
  UserManagementEdit,
  RoleManagement,
  RoleManagementEdit,
  RoleManagementCreate,
  UserManagementCreate,
  Profile,
  ProfileEdit,
  Report,
  HelpManagement,
  HelpManagementCreate,
  HelpManagementEdit,
  HelpData,
  HelpDataFaq,
  DataManagement,
  DataManagementInputWater,
  DataManagementInputTrash,
  DataManagementInputFlood,
  DataManagementInputCongestion,
  DataManagementInputKdb,
  SimulationTable,
  SimulationInput,
  SimulationHistory,
} from "./pages";
import PrivateRoute from "./PrivateRoute";

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
          <Route path="/forgotpassword" component={ForgotPassword} />
          <Route path="/reset/password" component={ResetPassword} />
          <PrivateRoute path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute path="/datamanagement">
            <DataManagement />
          </PrivateRoute>
          <PrivateRoute path="/datamanagementinput/kebutuhandata">
            <DataManagementInputPhase2 />
          </PrivateRoute>
          <PrivateRoute path="/datamanagementinput/kdbklb">
            <DataManagementInputKdb />
          </PrivateRoute>
          <PrivateRoute path="/datamanagementinput/water">
            <DataManagementInputWater />
          </PrivateRoute>
          <PrivateRoute path="/datamanagementinput/trash">
            <DataManagementInputTrash />
          </PrivateRoute>
          <PrivateRoute path="/datamanagementinput/flood">
            <DataManagementInputFlood />
          </PrivateRoute>
          <PrivateRoute path="/datamanagementinput/congestion">
            <DataManagementInputCongestion />
          </PrivateRoute>
          <PrivateRoute path="/datamanagementinput">
            <DataManagementInput />
          </PrivateRoute>
          <PrivateRoute path="/schenario">
            <SimulationTable />
          </PrivateRoute>
          <PrivateRoute path="/schenariomap">
            <SimulasiMap />
          </PrivateRoute>
          <PrivateRoute path="/schenarioinput">
            <SimulationInput />
          </PrivateRoute>
          <PrivateRoute path="/schenariohistory">
            <SimulationHistory />
          </PrivateRoute>
          <Route path="/resentmailconfirmation">
            <ResentEmailConfirmation />
          </Route>
          <PrivateRoute path="/usermanagement/create">
            <UserManagementCreate />
          </PrivateRoute>
          <PrivateRoute path="/usermanagement/edit">
            <UserManagementEdit />
          </PrivateRoute>
          <PrivateRoute path="/usermanagement">
            <UserManagement />
          </PrivateRoute>
          <PrivateRoute path="/rolemanagement/create">
            <RoleManagementCreate />
          </PrivateRoute>
          <PrivateRoute path="/rolemanagement/edit">
            <RoleManagementEdit />
          </PrivateRoute>
          <PrivateRoute path="/rolemanagement">
            <RoleManagement />
          </PrivateRoute>
          <PrivateRoute path="/helpmanagement/create">
            <HelpManagementCreate />
          </PrivateRoute>
          <PrivateRoute path="/helpmanagement/edit">
            <HelpManagementEdit />
          </PrivateRoute>
          <PrivateRoute path="/helpmanagement">
            <HelpManagement />
          </PrivateRoute>
          <PrivateRoute path="/help/faq">
            <HelpDataFaq />
          </PrivateRoute>
          <PrivateRoute path="/help">
            <HelpData />
          </PrivateRoute>
          <PrivateRoute path="/profile/edit">
            <ProfileEdit />
          </PrivateRoute>
          <PrivateRoute path="/profile">
            <Profile />
          </PrivateRoute>
          <PrivateRoute path="/report">
            <Report />
          </PrivateRoute>
          <Route path="/not-authorized" component={NotAuthorized} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
