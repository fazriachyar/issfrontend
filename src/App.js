import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import SchedulePage from "./SchedulePage";
import LokasiPage from "./LokasiPage";
import JenisPekerjaanPage from "./JenisPekerjaanPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/schedules" element={<SchedulePage />} />
      <Route path="/lokasi" element={<LokasiPage />} />
      <Route path="/jenis-pekerjaan" element={<JenisPekerjaanPage />} />
      {/* Definisikan rute lainnya di sini */}
    </Routes>
  );
}

export default App;
