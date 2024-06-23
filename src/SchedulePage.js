import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Table,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import {
  BsCheckCircle,
  BsPencilSquare,
  BsTrash,
  BsInfoCircle,
} from "react-icons/bs";
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

const ScheduleDetailModal = ({ show, handleClose, scheduleDetail }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Detail Jadwal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Jam Kerja:</strong> {scheduleDetail.jamMulai} -{" "}
          {scheduleDetail.jamSelesai}
        </p>
        <p>
          <strong>Jam Istirahat:</strong> {scheduleDetail.istirahatMulai} -{" "}
          {scheduleDetail.istirahatSelesai}
        </p>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Jenis Pekerjaan</th>
              <th>Lokasi Kerja</th>
            </tr>
          </thead>
          <tbody>
            {scheduleDetail.jenisPekerjaan &&
              scheduleDetail.jenisPekerjaan.map((jp, index) => (
                <tr key={index}>
                  <td>{jp}</td>
                  <td>{scheduleDetail.lokasiKerja[index]}</td>
                </tr>
              ))}
          </tbody>
        </Table>
        <div
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "0.25rem",
            padding: "0.375rem 0.75rem",
            margin: "1rem 0",
          }}
        >
          <strong>Catatan:</strong> {scheduleDetail.catatan}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Tutup
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

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [scheduleDetail, setScheduleDetail] = useState({});

  const [selectedLokasi, setSelectedLokasi] = useState([]);
  const [selectedJenisPekerjaan, setSelectedJenisPekerjaan] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      const userId = localStorage.getItem("user_id"); // Mengambil user_id dari localStorage
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/listjadwal`,
          { user_id: userId },
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

    const fetchLokasi = async () => {
      const token = localStorage.getItem("token");
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

    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
    const userId = localStorage.getItem("user_id"); // Mengambil user_id dari localStorage
    const token = localStorage.getItem("token");
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    payload.user_id = selectedUserId; // Menggunakan user_id yang dipilih

    const tanggal = formData.get("tanggal");
    const jamMulai = formData.get("jam_mulai");
    const jamSelesai = formData.get("jam_selesai");
    const restMulai = formData.get("istirahat_mulai");
    const restSelesai = formData.get("istirahat_selesai");

    payload.lokasi_kerja = JSON.stringify(selectedLokasi.map(Number));
    payload.jenis_pekerjaan = JSON.stringify(
      selectedJenisPekerjaan.map(Number)
    );

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
        `${process.env.REACT_APP_API_URL}/api/schedules`,
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
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/schedules/${id}`,
          {
            status: "Approved",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSchedules(
          schedules.map((schedule) =>
            schedule.id === id ? { ...schedule, status: "Approved" } : schedule
          )
        );
        // Refresh atau update state setelah approve
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdate = async (id, updatedSchedule) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/schedules/${id}`,
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

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props.text}
    </Tooltip>
  );

  const handleConfirmDelete = async () => {
    if (scheduleToDelete && scheduleToDelete.status !== "Approved") {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/schedules/${scheduleToDelete.id}`,
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

  const fetchScheduleDetail = async (scheduleId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/schedule/detail`,
        { scheduleId: scheduleId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScheduleDetail(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLokasiChange = (checked, id) => {
    setSelectedLokasi((prev) =>
      checked ? [...prev, id] : prev.filter((lokasiId) => lokasiId !== id)
    );
  };

  const handleJenisPekerjaanChange = (checked, id) => {
    setSelectedJenisPekerjaan((prev) =>
      checked ? [...prev, id] : prev.filter((jpId) => jpId !== id)
    );
  };

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <CustomNavbar />
        <div style={{ flex: 1, padding: "20px" }}>
          {/* Konten utama SchedulePage di sini */}
          <h2>List Jadwal Karyawan</h2>
          <Button onClick={() => setShowModal(true)} variant="primary">
            Create New
          </Button>
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

                {/* Lokasi Kerja Checkbox Group */}
                <Form.Group className="mb-3">
                  <Form.Label>Lokasi Kerja</Form.Label>
                  {lokasi.map((loc) => (
                    <Form.Check
                      key={loc.id}
                      type="checkbox"
                      label={loc.nama}
                      onChange={(e) =>
                        handleLokasiChange(e.target.checked, loc.id)
                      }
                    />
                  ))}
                </Form.Group>

                {/* Jenis Pekerjaan Checkbox Group */}
                <Form.Group className="mb-3">
                  <Form.Label>Jenis Pekerjaan</Form.Label>
                  {jenisPekerjaan.map((jp) => (
                    <Form.Check
                      key={jp.id}
                      type="checkbox"
                      label={jp.nama}
                      onChange={(e) =>
                        handleJenisPekerjaanChange(e.target.checked, jp.id)
                      }
                    />
                  ))}
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

          <ScheduleDetailModal
            show={showDetailModal}
            handleClose={() => setShowDetailModal(false)}
            scheduleDetail={scheduleDetail}
          />

          <table className="table">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Staff</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.scheduleId}>
                    <td>{schedule.scheduleId}</td>
                    <td>{schedule.name}</td>
                    <td>
                      <EditableCell
                        value={schedule.tanggal}
                        name="tanggal"
                        type="date"
                        onChange={(e) =>
                          handleUpdate(schedule.scheduleId, {
                            jadwal: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>{schedule.status}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip({ text: "Approve" })}
                      >
                        <Button
                          variant="success"
                          onClick={() =>
                            handleApprove(schedule.scheduleId, schedule.status)
                          }
                          disabled={schedule.status === "Approved"}
                        >
                          <BsCheckCircle />
                        </Button>
                      </OverlayTrigger>{" "}
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip({ text: "Delete" })}
                      >
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteClick(schedule)}
                          disabled={schedule.status === "Approved"}
                        >
                          <BsTrash />
                        </Button>
                      </OverlayTrigger>{" "}
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip({ text: "Details" })}
                      >
                        <Button
                          variant="info"
                          onClick={() =>
                            fetchScheduleDetail(schedule.scheduleId)
                          }
                        >
                          <BsInfoCircle />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </table>
        </div>
        <div
          style={{ position: "absolute", top: 0, right: 0, padding: "10px" }}
        ></div>
      </div>
    </>
  );
};

export default SchedulePage;
