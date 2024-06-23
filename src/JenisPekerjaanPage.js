import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Container, Table } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";

const JenisPekerjaanPage = () => {
  const [jenisPekerjaan, setJenisPekerjaan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJenisPekerjaan, setSelectedJenisPekerjaan] = useState(null);
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
      if (selectedJenisPekerjaan) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/jenis_pekerjaan/${selectedJenisPekerjaan.id}`,
          formValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/jenis_pekerjaan`,
          formValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      fetchJenisPekerjaan(); // Refresh data
      handleCloseModal(); // Close modal after submit
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddClick = () => {
    setSelectedJenisPekerjaan(null);
    setFormValues({ nama: "" });
    setShowModal(true);
  };

  const handleEditClick = (jenisPekerjaan) => {
    setSelectedJenisPekerjaan(jenisPekerjaan);
    setFormValues({ nama: jenisPekerjaan.nama });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/jenis_pekerjaan/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchJenisPekerjaan(); // Refresh data
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setSelectedJenisPekerjaan(null);
    setFormValues({ nama: "" });
    setShowModal(false);
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
              {jenisPekerjaan.map((jp) => (
                <tr key={jp.id}>
                  <td>{jp.nama}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleEditClick(jp)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(jp.id)}
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
        </Container>
      </div>
    </div>
  );
};

export default JenisPekerjaanPage;
