import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { BsCheckCircle } from "react-icons/bs";
import CustomNavbar from "./CustomNavbar";

const EditableCell = ({ value, onDoubleClick, onChange, name, type }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
    onDoubleClick && onDoubleClick();
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange && onChange(e);
    }
  };

  return isEditing ? (
    <input
      type={type} // Menggunakan tipe yang sesuai
      value={value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onChange={onChange}
      autoFocus
    />
  ) : (
    <span onDoubleClick={handleDoubleClick}>{value}</span>
  );
};

const ConfirmDeleteModal = ({ show, handleClose, handleConfirm }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Konfirmasi Penghapusan</Modal.Title>
      </Modal.Header>
      <Modal.Body>Apakah Anda yakin untuk menghapus jadwal ini?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Batal
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Hapus
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const token = localStorage.getItem("token"); // Mengambil token dari localStorage

  const [showModal, setShowModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  const [jenisPekerjaan, setJenisPekerjaan] = useState([]);
  const [lokasi, setLokasi] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/schedules",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSchedules(response.data); // Menyimpan data jadwal ke state
      } catch (error) {
        console.error(error);
      }
    };

    const fetchJenisPekerjaan = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://iss.biz.id/be/api/jenis_pekerjaan",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setJenisPekerjaan(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchLokasi = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://iss.biz.id/be/api/lokasi", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLokasi(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://iss.biz.id/be/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSchedules();
    fetchUsers();
    fetchJenisPekerjaan();
    fetchLokasi();
  }, []);

  const validateForm = (
    tanggal,
    jamMulai,
    jamSelesai,
    istirahatMulai,
    istirahatSelesai
  ) => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0); // Mengatur waktu ke awal hari
    const tanggalInput = new Date(tanggal);

    // Pengecekan tanggal harus lebih dari hari ini
    if (tanggalInput <= hariIni) {
      return "Tanggal harus lebih dari tanggal hari ini.";
    }

    // Konversi jam ke menit untuk perbandingan
    const convertToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const mulai = convertToMinutes(jamMulai);
    const selesai = convertToMinutes(jamSelesai);
    const istirahatStart = convertToMinutes(istirahatMulai);
    const istirahatEnd = convertToMinutes(istirahatSelesai);

    // Pengecekan jarak jam mulai dan jam selesai harus 9 jam
    if (selesai - mulai < 540) {
      // 540 menit = 9 jam
      return "Jam mulai dan jam selesai harus memiliki jarak 9 jam.";
    }

    // Pengecekan istirahat mulai dan selesai harus 1 jam dan berada di antara jam mulai dan selesai
    if (
      istirahatEnd - istirahatStart !== 60 ||
      istirahatStart <= mulai ||
      istirahatEnd >= selesai
    ) {
      return "Istirahat mulai dan istirahat selesai harus memiliki waktu 1 jam dan berada di antara jam mulai dan jam selesai.";
    }

    // Pengecekan jam mulai tidak boleh melebihi jam selesai dan sebaliknya
    if (mulai >= selesai) {
      return "Jam mulai tidak boleh melebihi jam selesai.";
    }

    // Semua validasi terpenuhi
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    payload.user_id = selectedUserId; // Menggunakan user_id yang dipilih

    const tanggal = formData.get("tanggal");
    const jamMulai = formData.get("jam_mulai");
    const jamSelesai = formData.get("jam_selesai");
    const restMulai = formData.get("istirahat_mulai");
    const restSelesai = formData.get("istirahat_selesai");

    const errorMessage = validateForm(
      tanggal,
      jamMulai,
      jamSelesai,
      restMulai,
      restSelesai
    );
    if (errorMessage) {
      setResponseMessage(errorMessage);
      setShowAlertModal(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/schedules",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201 && response.data) {
        setSchedules([...schedules, response.data]); // Menambahkan jadwal baru ke listJadwal
        setResponseMessage("Insert Success");
        setShowAlertModal(true);
        setShowModal(false);
      }
    } catch (error) {
      setResponseMessage(error.response.data.message);
      setShowAlertModal(true);
    }
  };

  const handleApprove = async (id, status) => {
    if (status !== "Approved") {
      try {
        // Mengirim request ke endpoint approve
        await axios.put(`http://localhost:8000/api/schedules/${id}`,{
					'status': 'Approved'
				}, {
          headers: { Authorization: `Bearer ${token}` },
        });

				setSchedules(schedules.map((schedule) => 
					schedule.id === id ? { ...schedule, status: 'Approved' } : schedule
				));
        // Refresh atau update state setelah approve
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdate = async (id, updatedSchedule) => {
    try {
      await axios.put(
        `http://localhost:8000/api/schedules/${id}`,
        updatedSchedule,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Reload page atau fetch data terbaru
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule); // Menyimpan jadwal yang akan dihapus
    setShowConfirmDeleteModal(true); // Menampilkan modal konfirmasi
  };

  const handleConfirmDelete = async () => {
    if (scheduleToDelete && scheduleToDelete.status !== "Approved") {
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/schedules/${scheduleToDelete.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Cek jika response memiliki key 'message'
        if (response.data && response.data.message) {
          setResponseMessage(response.data.message); // Set pesan untuk modal popup
          setShowAlertModal(true); // Tampilkan modal popup
        }

        const updatedSchedules = schedules.filter(
          (schedule) => schedule.id !== scheduleToDelete.id
        );
        setSchedules(updatedSchedules); // Memperbarui state dengan array baru
        setScheduleToDelete(null); // Menghapus referensi ke jadwal yang dihapus
      } catch (error) {
        console.error(error);
      }
    }
    setShowConfirmDeleteModal(false); // Menutup modal konfirmasi
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
					}
				`}
      </style>
			<CustomNavbar />
      <div className="container mt-5">
        <div className="container mt-5">
          <div className="container mt-5 d-flex justify-content-between">
            <h2>List Jadwal Karyawan</h2>
            <Button onClick={() => setShowModal(true)} variant="success">
              Create New
            </Button>
          </div>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title style={{ fontSize: "1.5rem" }}>
                Create New Schedule
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Staff</Form.Label>
                  <Form.Select
                    aria-label="User select"
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option>Pilih Staff</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {/* Tanggal */}
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal</Form.Label>
                  <Form.Control
                    type="date"
                    name="tanggal"
                    placeholder="YYYY-MM-DD"
                    required
                  />
                </Form.Group>

                {/* Lokasi Kerja */}
                <Form.Group className="mb-3">
                  <Form.Label>Lokasi Kerja</Form.Label>
                  <Form.Select name="lokasi_kerja" required>
                    <option value="">Pilih Lokasi</option>
                    {lokasi.map((loc) => (
                      <option key={loc.id} value={loc.nama}>
                        {loc.nama}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Jenis Pekerjaan */}
                <Form.Group className="mb-3">
                  <Form.Label>Jenis Pekerjaan</Form.Label>
                  <Form.Select name="jenis_pekerjaan" required>
                    <option value="">Pilih Jenis Pekerjaan</option>
                    {jenisPekerjaan.map((jp) => (
                      <option key={jp.id} value={jp.nama}>
                        {jp.nama}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Jam Mulai */}
                <Form.Group className="mb-3">
                  <Form.Label>Jam Mulai</Form.Label>
                  <Form.Control
                    type="time"
                    name="jam_mulai"
                    placeholder="HH:MM"
                    required
                  />
                </Form.Group>

                {/* Jam Selesai */}
                <Form.Group className="mb-3">
                  <Form.Label>Jam Selesai</Form.Label>
                  <Form.Control
                    type="time"
                    name="jam_selesai"
                    placeholder="HH:MM"
                    required
                  />
                </Form.Group>

                {/* Istirahat Mulai */}
                <Form.Group className="mb-3">
                  <Form.Label>Istirahat Mulai</Form.Label>
                  <Form.Control
                    type="time"
                    name="istirahat_mulai"
                    placeholder="HH:MM"
                    required
                  />
                </Form.Group>

                {/* Istirahat Selesai */}
                <Form.Group className="mb-3">
                  <Form.Label>Istirahat Selesai</Form.Label>
                  <Form.Control
                    type="time"
                    name="istirahat_selesai"
                    placeholder="HH:MM"
                    required
                  />
                </Form.Group>

                {/* Status */}
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" required>
                    <option value="">Pilih status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>

                {/* Catatan */}
                <Form.Group className="mb-3">
                  <Form.Label>Catatan</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="catatan"
                    placeholder="Tambahkan catatan di sini"
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          <Modal
            show={showAlertModal}
            onHide={() => setShowAlertModal(false)}
            centered
          >
            <Modal.Body className="text-center">
              <BsCheckCircle size="3em" color="green" />
              <p className="mt-3">{responseMessage}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="success"
                onClick={() => setShowAlertModal(false)}
              >
                OK
              </Button>
            </Modal.Footer>
          </Modal>

          <ConfirmDeleteModal
            show={showConfirmDeleteModal}
            handleClose={() => setShowConfirmDeleteModal(false)}
            handleConfirm={handleConfirmDelete}
          />

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Jenis Pekerjaan</th>
								<th>Lokasi Kerja</th>
                <th>Tanggal</th>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.id}</td>
                  <td>
                    <EditableCell
                      value={schedule.jenis_pekerjaan}
                      name="jenis_pekerjaan"
                      type="text"
                      onChange={(e) =>
                        handleUpdate(schedule.id, {
                          jenis_pekerjaan: e.target.value,
                        })
                      }
                    />
                  </td>
									<td>
                    <EditableCell
                      value={schedule.jenis_pekerjaan}
                      name="jenis_pekerjaan"
                      type="text"
                      onChange={(e) =>
                        handleUpdate(schedule.id, {
                          jenis_pekerjaan: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={schedule.tanggal}
                      name="tanggal"
                      type="date"
                      onChange={(e) =>
                        handleUpdate(schedule.id, { jadwal: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={schedule.jam_mulai}
                      name="jam_mulai"
                      type="time"
                      onChange={(e) =>
                        handleUpdate(schedule.id, { jam_mulai: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={schedule.jam_selesai}
                      name="jam_selesai"
                      type="time"
                      onChange={(e) =>
                        handleUpdate(schedule.id, {
                          jam_selesai: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>{schedule.status}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleApprove(schedule.id, schedule.status)
                      }
                      className={`btn ${
                        schedule.status === "Approved"
                          ? "btn-secondary"
                          : "btn-success"
                      }`}
                      disabled={schedule.status === "Approved"}
                    >
                      Approve
                    </button>{" "}
                    <button
                      onClick={() => handleDeleteClick(schedule)}
                      className={`btn ${
                        schedule.status === "Approved"
                          ? "btn-secondary"
                          : "btn-danger"
                      }`}
                      disabled={schedule.status === "Approved"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SchedulePage;
