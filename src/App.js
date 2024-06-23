import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./LoginPage";
import SchedulePage from "./SchedulePage";
import LokasiPage from "./LokasiPage";
import JenisPekerjaanPage from "./JenisPekerjaanPage";
import LoadingSpinner from "./LoadingSpinner"; // Pastikan Anda telah membuat komponen ini

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Mulai menampilkan loading spinner
    setIsLoading(true);

    // Simulasikan delay untuk fetch data atau proses lainnya
    const timer = setTimeout(() => {
      // Hentikan loading spinner
      setIsLoading(false);
    }, 1000); // Atur durasi sesuai kebutuhan

    // Bersihkan timer ketika komponen unmount atau lokasi berubah
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/schedules" element={<SchedulePage />} />
        <Route path="/lokasi" element={<LokasiPage />} />
        <Route path="/jenis-pekerjaan" element={<JenisPekerjaanPage />} />
        {/* Definisikan rute lainnya di sini */}
      </Routes>
    </>
  );
}

export default App;
