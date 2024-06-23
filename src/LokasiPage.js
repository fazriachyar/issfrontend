import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Container, Table } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";

const LokasiPage = () => {
  const [lokasi, setLokasi] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLokasi, setSelectedLokasi] = useState(null);
  const [formValues, setFormValues] = useState({ nama: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLokasi();
  }, []);

  const fetchLokasi = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/lokasi`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLokasi(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLokasi) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/lokasi/${selectedLokasi.id}`,
          formValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/lokasi`,
          formValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      fetchLokasi(); // Refresh data
      handleCloseModal(); // Close modal after submit
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddClick = () => {
    setSelectedLokasi(null);
    setFormValues({ nama: "" });
    setShowModal(true);
  };

  const handleEditClick = (lokasi) => {
    setSelectedLokasi(lokasi);
    setFormValues({ nama: lokasi.nama });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/lokasi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLokasi(); // Refresh data
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setSelectedLokasi(null);
    setFormValues({ nama: "" });
    setShowModal(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <CustomNavbar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Container>
          <h2>Manajemen Lokasi</h2>
          <Button variant="primary" onClick={handleAddClick} className="my-3">
            Tambah Lokasi
          </Button>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nama Lokasi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lokasi.map((loc) => (
                <tr key={loc.id}>
                  <td>{loc.nama}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleEditClick(loc)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(loc.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal for Create/Edit */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedLokasi ? "Edit Lokasi" : "Tambah Lokasi"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleFormSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Lokasi</Form.Label>
                  <Form.Control
                    type="text"
                    name="nama"
                    value={formValues.nama}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit">
                  Simpan
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default LokasiPage;
