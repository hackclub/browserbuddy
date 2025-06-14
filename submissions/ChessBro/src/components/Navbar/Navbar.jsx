import React from "react";
import "./Navbar.css";
import Logo from "../../assets/branding/logo.png";
const Navbar = () => {
  return (
    <nav className="navbar">
      <h1 id="navbar_heading">
        <img src={Logo} id="logo" />
        ChessBro
      </h1>
    </nav>
  );
};

export default Navbar;
