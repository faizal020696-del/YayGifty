import React, { useState } from 'react';
import FormAlamat from '../lib/FormAlamat';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);

  const handleSaveAddress = (data) => {
    setSavedAddress(data);
    setIsModalOpen(false);
    alert('Alamat berhasil disimpan!');
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* HEADER / TAMPILAN UTAMA LU */}
      <h1>Selamat Datang di YayGifty 🎁</h1>
      <p>Aplikasi kado & gift card terbaik.</p>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #ccc', borderRadius: '8px' }}>
        <h3>Alamat Pengiriman Saya</h3>
        {savedAddress ? (
          <div>
            <p><strong>Penerima:</strong> {savedAddress.namaPenerima} ({savedAddress.noHp})</p>
            <p><strong>Alamat:</strong> {savedAddress.detailAlamat}</p>
            <p><strong>Wilayah:</strong> {savedAddress.villageName}, {savedAddress.districtName}, {savedAddress.cityName}, {savedAddress.provinceName}</p>
          </div>
        ) : (
          <p style={{ color: '#777' }}>Belum ada alamat yang tersimpan.</p>
        )}

        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            marginTop: '10px', 
            padding: '10px 20px', 
            background: '#0070f3', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {savedAddress ? 'Ubah Alamat' : '+ Tambah / Atur Alamat'}
        </button>
      </div>

      {/* POP-UP / MODAL FORM ALAMAT */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <FormAlamat 
              onSave={handleSaveAddress} 
              onClose={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}