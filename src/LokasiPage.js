import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Container, Table } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";

const LokasiPage = () => {
  const [lokasi, setLokasi] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLokasi, setSelectedLokasi] = useState(null); // null untuk create, objek lokasi untuk edit
  const [formValues, setFormValues] = useState({ nama: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLokasi();
  }, []);

  const fetchLokasi = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/lokasi", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const response = selectedLokasi
        ? await axios.put(
            `http://127.0.0.1:8000/api/lokasi/${selectedLokasi.id}`,
            formValues,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        : await axios.post("http://127.0.0.1:8000/api/lokasi", formValues, {
            headers: { Authorization: `Bearer ${token}` },
          });

      fetchLokasi(); // Refresh data
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (lokasi) => {
    setSelectedLokasi(lokasi);
    setFormValues(lokasi);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/lokasi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLokasi(); // Refresh data
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container className="mt-5">
        {/* Konten LokasiPage */}
        <Container className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Manajemen Lokasi</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Tambah Lokasi
            </Button>
          </div>

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
          <Modal show={showModal} onHide={() => setShowModal(false)}>
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
      </Container>
    </>
  );
};

export default LokasiPage;
