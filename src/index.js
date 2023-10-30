import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import ReactGA from "react-ga4";

const trackingId = "G-YSFDG6Q19W"; // Replace with your Google Analytics tracking ID
ReactGA.initialize(trackingId);
ReactGA.send({
  hitType: "pageview",
  page: window.location.pathname,
});
ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);
