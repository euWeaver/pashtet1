import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import HomePage from "./components/HomePage";
import SecondPage from "./components/SecondPage";
import ThirdPage from "./components/ThirdPage";
import FourthPage from "./components/FourthPage";
import EmailContext from "./components/EmailContext";
import ReactGA from "react-ga";
function App() {
  const [email, setEmail] = useState("");
  const trackingId = "G-YSFDG6Q19W"; // Replace with your Google Analytics tracking ID
  ReactGA.initialize(trackingId);
  return (
    <div className="App">
      <Switch>
        <EmailContext.Provider value={{ email, setEmail }}>
          <Route exact path="/" component={HomePage} />
          <Route path="/second" component={SecondPage} />
          <Route path="/third" component={ThirdPage} />
          <Route path="/fourth" component={FourthPage} />
        </EmailContext.Provider>
      </Switch>
    </div>
  );
}

export default App;
