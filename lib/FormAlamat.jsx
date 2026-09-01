import React, { useState, useEffect } from 'react';

export default function FormAlamat({ onSave, onClose }) {
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [namaPenerima, setNamaPenerima] = useState('');
  const [noHp, setNoHp] = useState('');
  const [detailAlamat, setDetailAlamat] = useState('');

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedRegency, setSelectedRegency] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);

  const handleProvinceChange = (e) => {
    const provId = e.target.value;
    const provObj = provinces.find(p => p.id === provId);
    setSelectedProvince(provObj || null);
    setSelectedRegency(null); setSelectedDistrict(null); setSelectedVillage(null);
    setRegencies([]); setDistricts([]); setVillages([]);

    if (provId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`)
        .then((res) => res.json())
        .then((data) => setRegencies(data));
    }
  };

  const handleRegencyChange = (e) => {
    const regId = e.target.value;
    const regObj = regencies.find(r => r.id === regId);
    setSelectedRegency(regObj || null);
    setSelectedDistrict(null); setSelectedVillage(null);
    setDistricts([]); setVillages([]);

    if (regId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regId}.json`)
        .then((res) => res.json())
        .then((data) => setDistricts(data));
    }
  };

  const handleDistrictChange = (e) => {
    const distId = e.target.value;
    const distObj = districts.find(d => d.id === distId);
    setSelectedDistrict(distObj || null);
    setSelectedVillage(null);
    setVillages([]);

    if (distId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${distId}.json`)
        .then((res) => res.json())
        .then((data) => setVillages(data));
    }
  };

  const handleVillageChange = (e) => {
    const vilId = e.target.value;
    const vilObj = villages.find(v => v.id === vilId);
    setSelectedVillage(vilObj || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedVillage) return alert('Lengkapi data wilayah terlebih dahulu!');

    onSave({
      namaPenerima,
      noHp,
      detailAlamat,
      provinceName: selectedProvince?.name,
      cityName: selectedRegency?.name,
      districtName: selectedDistrict?.name,
      villageName: selectedVillage?.name,
      districtId: selectedDistrict?.id,
      postalCode: '15310' // Sampel sementara
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginTop: 0 }}>Tambah Alamat Baru</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Nama Penerima:</label>
        <input type="text" required value={namaPenerima} onChange={(e) => setNamaPenerima(e.target.value)} style={{ width: '100%', padding: '8px' }} />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Nomor HP:</label>
        <input type="tel" required value={noHp} onChange={(e) => setNoHp(e.target.value)} style={{ width: '100%', padding: '8px' }} />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Provinsi:</label>
        <select value={selectedProvince?.id || ''} onChange={handleProvinceChange} style={{ width: '100%', padding: '8px' }}>
          <option value="">-- Pilih Provinsi --</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Kota / Kabupaten:</label>
        <select value={selectedRegency?.id || ''} onChange={handleRegencyChange} disabled={!selectedProvince} style={{ width: '100%', padding: '8px' }}>
          <option value="">-- Pilih Kota --</option>
          {regencies.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Kecamatan:</label>
        <select value={selectedDistrict?.id || ''} onChange={handleDistrictChange} disabled={!selectedRegency} style={{ width: '100%', padding: '8px' }}>
          <option value="">-- Pilih Kecamatan --</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Kelurahan:</label>
        <select value={selectedVillage?.id || ''} onChange={handleVillageChange} disabled={!selectedDistrict} style={{ width: '100%', padding: '8px' }}>
          <option value="">-- Pilih Kelurahan --</option>
          {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Detail Alamat (Jalan, RT/RW, No. Rumah):</label>
        <textarea required value={detailAlamat} onChange={(e) => setDetailAlamat(e.target.value)} style={{ width: '100%', padding: '8px', height: '60px' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px' }}>Batal</button>
        <button type="submit" style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>Simpan Alamat</button>
      </div>
    </form>
  );
}