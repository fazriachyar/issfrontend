import React from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa"; // Contoh ikon

const CustomNavbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const initials = username
    ? username
        .split(" ")
        .map((name) => name[0])
        .join("")
    : "NN";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "250px", background: "#f8f9fa", padding: "10px" }}>
        <h2>ISS HIGHSCOPE</h2>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/schedules">
            <FaCalendarAlt /> Jadwal
          </Nav.Link>
          <Nav.Link as={Link} to="/jenis-pekerjaan">
            <FaBriefcase /> Jenis Pekerjaan
          </Nav.Link>
          <Nav.Link as={Link} to="/lokasi">
            <FaMapMarkerAlt /> Lokasi
          </Nav.Link>
          {/* ... other nav links with icons ... */}
        </Nav>
      </div>
      <div style={{ flex: 1, padding: "10px" }}>
        {/* Main content goes here */}
      </div>
      <div style={{ position: "absolute", top: 0, right: 0, padding: "10px" }}>
        <NavDropdown
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <span style={{ marginRight: "10px" }}>{username}</span>
              <div className="initials-circle">{initials}</div>
            </div>
          }
          id="nav-dropdown"
          align="end"
          drop="down"
          renderMenuOnMount={true}
        >
          <NavDropdown.Item as={Link} to="/profile">
            Profile
          </NavDropdown.Item>
          <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
        </NavDropdown>
      </div>
    </div>
  );
};

export default CustomNavbar;
