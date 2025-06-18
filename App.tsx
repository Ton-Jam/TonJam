import React from "react";
import ProfileScreen from "./ProfileScreen";

const App = () => {
  return <ProfileScreen closePage={() => console.log("Close clicked")} />;
};

export default App;
