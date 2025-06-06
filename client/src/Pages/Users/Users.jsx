import React from "react";

import "./Users.css";
import UsersList from "./UsersList";

const Users = ({ slideIn, handleSlideIn }) => {
  return (
      <div className="home-container-1" style={{ marginTop: "30px" }}>
        <h1 style={{ fontWeight: "400" }}>Users</h1>
        <UsersList />
      </div>
  );
};

export default Users;