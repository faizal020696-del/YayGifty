import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Edit daftar produk lo di sini
const PRODUCTS = [
  { id: 1, name: 'Hampers Gift Box A', price: 75000, image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Hampers Gift Box B', price: 120000, image: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Custom Bucket Bunga', price: 50000, image: 'https://via.placeholder.com/150' },
]

export default function Home() {
  const [cart, setCart] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Tambah barang ke keranjang
  const addToCart = (product) => {
    setCart([...cart, product])
  }

  // Hitung total harga
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return alert('Keranjang masih kosong, pilih produk dulu bro!')
    if (!file) return alert('Upload bukti transfer dulu bro!')

    setLoading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file)

      if (storageError) throw storageError

      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)

      const proofUrl = publicUrlData.publicUrl

      const itemNames = cart.map(i => i.name).join(', ')

      const { error: dbError } = await supabase
        .from('orders')
        .insert([{
          customer_name: name,
          customer_phone: phone,
          shipping_address: `${address} (Pesanan: ${itemNames})`,
          total_price: totalPrice,
          proof_url: proofUrl,
          status: 'pending'
        }])

      if (dbError) throw dbError

      alert('Pesanan berhasil terkirim! Admin akan mengecek pembayaranmu.')
      setCart([])
      setName('')
      setPhone('')
      setAddress('')
      setFile(null)
    } catch (error) {
      alert('Gagal mengirim pesanan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>YayGifty Store</h1>
      
      {/* KATALOG PRODUK */}
      <h2>Pilih Produk</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {PRODUCTS.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '4px' }} />
            <h3 style={{ margin: '10px 0 5px' }}>{product.name}</h3>
            <p style={{ fontWeight: 'bold', color: '#2563eb' }}>Rp {product.price.toLocaleString('id-ID')}</p>
            <button 
              onClick={() => addToCart(product)}
              style={{ padding: '8px 15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Tambah ke Keranjang
            </button>
          </div>
        ))}
      </div>

      {/* FORM CHECKOUT & KERANJANG */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#f9fafb' }}>
        <h2>Checkout & Pembayaran</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <h4>Keranjang Belanja ({cart.length} barang):</h4>
          {cart.length === 0 ? <p style={{ color: '#666' }}>Belum ada produk dipilih.</p> : (
            <ul>
              {cart.map((item, idx) => (
                <li key={idx}>{item.name} - Rp {item.price.toLocaleString('id-ID')}</li>
              ))}
            </ul>
          )}
          <h3>Total Bayar: Rp {totalPrice.toLocaleString('id-ID')}</h3>
        </div>

        <div style={{ background: '#e5e7eb', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          <p style={{ margin: 0 }}>Transfer BCA: <strong>123-456-7890</strong> a.n YayGifty</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Nama Lengkap" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px' }} />
          <input type="tel" placeholder="Nomor WhatsApp" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '8px' }} />
          <textarea placeholder="Alamat Pengiriman Lengkap" required value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: '8px' }} />
          
          <label>Upload Bukti Transfer:</label>
          <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} />

          <button type="submit" disabled={loading} style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
          </button>
        </form>
      </div>
    </div>
  )
}