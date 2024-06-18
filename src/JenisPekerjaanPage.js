import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Container, Table } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";

const JenisPekerjaanPage = () => {
  const [jenisPekerjaan, setJenisPekerjaan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJenisPekerjaan, setSelectedJenisPekerjaan] = useState(null); // null untuk create, objek jenisPekerjaan untuk edit
  const [formValues, setFormValues] = useState({ nama: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchJenisPekerjaan();
  }, []);

  const fetchJenisPekerjaan = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/jenis_pekerjaan`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJenisPekerjaan(response.data);
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
      const response = selectedJenisPekerjaan
        ? await axios.put(
            `${process.env.REACT_APP_API_URL}/api/jenis_pekerjaan/${selectedJenisPekerjaan.id}`,
            formValues,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        : await axios.post(
            `${process.env.REACT_APP_API_URL}/api/jenis_pekerjaan`,
            formValues,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

      fetchJenisPekerjaan(); // Refresh data
      setShowModal(false);
      setSelectedJenisPekerjaan(null);
      setFormValues({ nama: "" });
      setShowModal(false); // Tutup modal
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddClick = () => {
    setSelectedJenisPekerjaan(null); // Reset selectedLokasi
    setFormValues({ nama: "" }); // Reset formValues
    setShowModal(true); // Buka modal
  };

  const handleEditClick = (jenisPekerjaan) => {
    setSelectedJenisPekerjaan(jenisPekerjaan);
    setFormValues(jenisPekerjaan);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/jenis_pekerjaan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJenisPekerjaan(); // Refresh data
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <CustomNavbar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Container>
          <h2>Manajemen Pekerjaan</h2>
          <Button variant="primary" onClick={handleAddClick} className="my-3">
            Tambah Pekerjaan
          </Button>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Pekerjaan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jenisPekerjaan.map((loc) => (
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

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedJenisPekerjaan ? "Edit Pekerjaan" : "Tambah Pekerjaan"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleFormSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Pekerjaan</Form.Label>
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
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            {/* ... Modal content ... */}
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default JenisPekerjaanPage;
