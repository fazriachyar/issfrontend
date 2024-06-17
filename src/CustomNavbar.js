import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; // Gunakan useNavigate

const CustomNavbar = () => {
  const navigate = useNavigate(); // Hook untuk navigasi
  const username = localStorage.getItem("username");
  const initials = username
    ? username
        .split(" ")
        .map((name) => name[0])
        .join("")
    : "NN";

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    localStorage.clear(); // Menghapus semua data di localStorage
    navigate("/"); // Navigasi kembali ke halaman login
  };

  return (
    <>
      <style type="text/css">
        {`
          .initials-circle {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background-color: #007bff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
            cursor: pointer; // Menambahkan pointer ketika hover
          }
          .navbar .dropdown-toggle::after {
            display: none;
          }
        `}
      </style>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            ISS HIGHSCOPE
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Tambahkan list menu di sini */}
              <NavDropdown title="Manajemen" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/schedules">
                  Jadwal
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/jenis-pekerjaan">
                  Jenis Pekerjaan
                </NavDropdown.Item>
              </NavDropdown>
              {/* ... */}
            </Nav>
            <Nav>
              <Navbar.Text>
                {username}
              </Navbar.Text>
              {/* Dropdown untuk Profile dan Logout */}
              <NavDropdown
                title={<div className="initials-circle">{initials}</div>}
                id="nav-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default CustomNavbar;
