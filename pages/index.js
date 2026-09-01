import React, { useState } from 'react';
import FormAlamat from '../lib/FormAlamat';

export default function Home() {
  // State Checkout & Shipping
  const [shippingAddress, setShippingAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('');

  // Dummy opsi ongkir (Nanti disambungin ke API Biteship/RajaOngkir)
  const shippingOptions = [
    { id: 'jne-reg', courier: 'JNE', service: 'Reguler (1-2 Hari)', price: 12000 },
    { id: 'sicepat-reg', courier: 'SiCepat', service: 'Gokil / Reguler (1-2 Hari)', price: 11000 },
    { id: 'jnt-ez', courier: 'J&T', service: 'EZ (1-3 Hari)', price: 13000 },
  ];

  // Callback saat user menyimpan alamat di FormAlamat
  const handleSaveAddress = (addressData) => {
    setShippingAddress(addressData);
    setIsModalOpen(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Checkout YayGifty</h1>

      {/* STEP 1: ALAMAT PENGIRIMAN */}
      <section style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>1. Alamat Pengiriman</h2>
        
        {shippingAddress ? (
          <div>
            <p style={{ margin: '5px 0' }}><strong>Penerima:</strong> {shippingAddress.namaPenerima} ({shippingAddress.noHp})</p>
            <p style={{ margin: '5px 0' }}><strong>Alamat Lengkap:</strong> {shippingAddress.detailAlamat}</p>
            <p style={{ margin: '5px 0' }}>
              <strong>Wilayah:</strong> {shippingAddress.villageName}, {shippingAddress.districtName}, {shippingAddress.cityName}, {shippingAddress.provinceName}
            </p>
            <p style={{ margin: '5px 0' }}><strong>Kode Pos:</strong> {shippingAddress.postalCode}</p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{ marginTop: '10px', padding: '6px 12px', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
            >
              Ubah Alamat
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#666' }}>Belum ada alamat pengiriman yang dipilih.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Tambah Alamat Pengiriman
            </button>
          </div>
        )}
      </section>

      {/* STEP 2: METODE PENGIRIMAN & ONGKIR */}
      <section style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px', opacity: shippingAddress ? 1 : 0.5 }}>
        <h2>2. Opsi Pengiriman</h2>
        {!shippingAddress ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>Silakan isi alamat pengiriman terlebih dahulu.</p>
        ) : (
          <div>
            {shippingOptions.map((option) => (
              <div key={option.id} style={{ marginBottom: '10px' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="shipping" 
                    value={option.id}
                    checked={selectedCourier === option.id}
                    onChange={() => setSelectedCourier(option.id)}
                  />
                  <strong> {option.courier}</strong> - {option.service} (Rp {option.price.toLocaleString('id-ID')})
                </label>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* STEP 3: PEMBAYARAN */}
      <section style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px', opacity: selectedCourier ? 1 : 0.5 }}>
        <h2>3. Ringkasan & Pembayaran</h2>
        <button 
          disabled={!shippingAddress || !selectedCourier}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: shippingAddress && selectedCourier ? '#22c55e' : '#ccc', 
            color: '#fff', 
            fontWeight: 'bold', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: shippingAddress && selectedCourier ? 'pointer' : 'not-allowed' 
          }}
          onClick={() => alert('Pesanan berhasil dibuat!')}
        >
          Bayar Sekarang
        </button>
      </section>

      {/* MODAL FORM ALAMAT */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
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