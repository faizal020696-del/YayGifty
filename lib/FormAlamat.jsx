import React, { useState, useEffect } from 'react';

export default function FormAlamat() {
  // State Data Dropdown dari API
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // State Pilihan User (ID & Nama)
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  // State Loading Indicator
  const [loading, setLoading] = useState(false);

  // 1. Fetch Provinsi saat komponen pertama kali dibuka
  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error('Gagal ambil data provinsi:', err));
  }, []);

  // 2. Fetch Kota/Kabupaten ketika Provinsi dipilih
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    
    // Reset pilihan di bawahnya
    setSelectedRegency('');
    setSelectedDistrict('');
    setSelectedVillage('');
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    if (provinceId) {
      setLoading(true);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`)
        .then((res) => res.json())
        .then((data) => setRegencies(data))
        .finally(() => setLoading(false));
    }
  };

  // 3. Fetch Kecamatan ketika Kota/Kabupaten dipilih
  const handleRegencyChange = (e) => {
    const regencyId = e.target.value;
    setSelectedRegency(regencyId);

    // Reset pilihan di bawahnya
    setSelectedDistrict('');
    setSelectedVillage('');
    setDistricts([]);
    setVillages([]);

    if (regencyId) {
      setLoading(true);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`)
        .then((res) => res.json())
        .then((data) => setDistricts(data))
        .finally(() => setLoading(false));
    }
  };

  // 4. Fetch Kelurahan ketika Kecamatan dipilih
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);

    // Reset pilihan di bawahnya
    setSelectedVillage('');
    setVillages([]);

    if (districtId) {
      setLoading(true);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`)
        .then((res) => res.json())
        .then((data) => setVillages(data))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h3>Form Pilih Alamat Indonesia</h3>
      
      {/* --- DROPDOWN PROVINSI --- */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Provinsi:</label>
        <select 
          value={selectedProvince} 
          onChange={handleProvinceChange}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">-- Pilih Provinsi --</option>
          {provinces.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {prov.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- DROPDOWN KOTA / KABUPATEN --- */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Kota / Kabupaten:</label>
        <select 
          value={selectedRegency} 
          onChange={handleRegencyChange}
          disabled={!selectedProvince}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">-- Pilih Kota / Kabupaten --</option>
          {regencies.map((reg) => (
            <option key={reg.id} value={reg.id}>
              {reg.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- DROPDOWN KECAMATAN --- */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Kecamatan:</label>
        <select 
          value={selectedDistrict} 
          onChange={handleDistrictChange}
          disabled={!selectedRegency}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">-- Pilih Kecamatan --</option>
          {districts.map((dist) => (
            <option key={dist.id} value={dist.id}>
              {dist.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- DROPDOWN KELURAHAN / DESA --- */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Kelurahan / Desa:</label>
        <select 
          value={selectedVillage} 
          onChange={(e) => setSelectedVillage(e.target.value)}
          disabled={!selectedDistrict}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">-- Pilih Kelurahan --</option>
          {villages.map((vil) => (
            <option key={vil.id} value={vil.id}>
              {vil.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: 'gray', fontStyle: 'italic' }}>Sedang mengambil data...</p>}
    </div>
  );
}