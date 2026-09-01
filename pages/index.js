import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalPrice = 150000; // Ubah harga produk di sini

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Harap upload bukti transfer!');

    setLoading(true);

    try {
      // 1. Upload Gambar Bukti Bayar ke Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: storageError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (storageError) throw storageError;

      // 2. Ambil Public URL Foto
      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const proofUrl = publicUrlData.publicUrl;

      // 3. Simpan data transaksi ke tabel 'orders'
      const { error: dbError } = await supabase.from('orders').insert([
        {
          customer_name: name,
          customer_phone: phone,
          shipping_address: address,
          total_price: totalPrice,
          proof_url: proofUrl,
          status: 'pending',
        },
      ]);

      if (dbError) throw dbError;

      alert('Berhasil! Pesanan lo sedang diproses.');
      setName(''); setPhone(''); setAddress(''); setFile(null);
    } catch (err) {
      alert('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>Checkout Toko Online</h2>
      <div style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
        <p>Total Bayar: <strong>Rp {totalPrice.toLocaleString('id-ID')}</strong></p>
        <p>Transfer BCA: <strong>123-456-7890</strong></p>
        <p style={{ fontSize: '12px', color: '#666' }}>Atau scan QRIS toko kami.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="Nama Lengkap" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px' }} />
        <input type="tel" placeholder="Nomor WhatsApp" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '8px' }} />
        <textarea placeholder="Alamat Pengiriman" required value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: '8px' }} />
        <div>
          <label style={{ fontSize: '12px' }}>Upload Bukti Transfer:</label>
          <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} style={{ marginTop: '5px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
        </button>
      </form>
    </div>
  );
}