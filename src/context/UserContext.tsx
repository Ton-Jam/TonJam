import React, { createContext, useContext, useState } from "react";

const defaultUser = {
  name: "TonJam User",
  bio: "Music is life 🎵",
  profilePic: "/icon-user.png",
  isVerified: false,
};

export const UserContext = createContext({
  user: defaultUser,
  setUser: (data: any) => {},
});

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
