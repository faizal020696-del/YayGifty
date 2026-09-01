import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Produk YayGifty dengan gambarUnsplash berkualitas tinggi
const PRODUCTS = [
  { 
    id: 1, 
    name: 'Exclusive Gift Box A', 
    price: 75000, 
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60' 
  },
  { 
    id: 2, 
    name: 'Luxury Hampers Box B', 
    price: 120000, 
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?w=500&auto=format&fit=crop&q=60' 
  },
  { 
    id: 3, 
    name: 'Custom Dried Flower Bouquet', 
    price: 50000, 
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60' 
  },
]

export default function Home() {
  const [cart, setCart] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BCA')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Tambah item ke keranjang
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prevCart, { ...product, qty: 1 }]
    })
  }

  // Kelola jumlah quantity (tambah/kurang)
  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  // Hapus item dari keranjang
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  // Hitung Total Bayar
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return alert('Keranjang masih kosong, pilih produk dulu bro!')
    if (!file) return alert('Upload bukti transfer dulu bro!')

    setLoading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: storageError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file)

      if (storageError) throw storageError

      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)

      const proofUrl = publicUrlData.publicUrl
      const itemSummary = cart.map((i) => `${i.name} (x${i.qty})`).join(', ')

      const { error: dbError } = await supabase
        .from('orders')
        .insert([{
          customer_name: name,
          customer_phone: phone,
          shipping_address: `${address} | Metpay: ${paymentMethod} | Catatan: ${note || '-'} | Items: ${itemSummary}`,
          total_price: totalPrice,
          proof_url: proofUrl,
          status: 'pending'
        }])

      if (dbError) throw dbError

      alert('Pesanan berhasil tersimpan! Lo bakal di-redirect ke WhatsApp Admin.')

      // Redirect otomatis ke WhatsApp Admin
      const adminWA = '6281996106412' // GANTI DENGAN NOMOR WA LO (pake format 62)
      const waMessage = `Halo Admin YayGifty, saya sudah bayar via ${paymentMethod}!\n\n` +
        `*Detail Pesanan:*\n- Nama: ${name}\n- WA: ${phone}\n- Pesanan: ${itemSummary}\n- Total: Rp ${totalPrice.toLocaleString('id-ID')}\n- Catatan: ${note || '-'}\n\n` +
        `Bukti Transfer: ${proofUrl}`

      window.open(`https://wa.me/${adminWA}?text=${encodeURIComponent(waMessage)}`, '_blank')

      setCart([])
      setName('')
      setPhone('')
      setAddress('')
      setNote('')
      setFile(null)
    } catch (error) {
      alert('Gagal mengirim pesanan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#1f2937' }}>
      
      {/* HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #f3f4f6' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#4f46e5', margin: 0 }}>🎁 YayGifty</h1>
        <p style={{ color: '#4b5563', marginTop: '8px' }}>Pilihan Hampers & Hadiah Spesial untuk Orang Tersayang</p>
      </header>
      
      {/* KATALOG PRODUK */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px' }}>Katalog Produk</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {PRODUCTS.map((product) => (
            <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#fff' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px' }}>{product.name}</h3>
                <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#4f46e5', margin: '0 0 16px' }}>
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <button 
                  onClick={() => addToCart(product)}
                  style={{ width: '100%', padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  + Tambah ke Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FORM CHECKOUT & KERANJANG */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', background: '#f9fafb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: 0, marginBottom: '20px' }}>🛒 Checkout & Ringkasan</h2>
        
        {/* DETAIL KERANJANG */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Produk Dipilih ({cart.reduce((a, b) => a + b.qty, 0)} item):</h4>
          
          {cart.length === 0 ? (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>Keranjang belanjaan kamu masih kosong nih.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #e5e7eb' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '8px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>Total Bayar:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#4f46e5' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* METODE PEMBAYARAN */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Pilih Bank / Metode Transfer:</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #93c5fd', background: '#fff', fontWeight: '600', marginBottom: '12px' }}
          >
            <option value="BCA">Bank BCA (123-456-7890 a.n YayGifty)</option>
            <option value="Mandiri">Bank Mandiri (987-000-1111 a.n YayGifty)</option>
            <option value="QRIS / E-Wallet">QRIS / GoPay / OVO (0812-3456-7890)</option>
          </select>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
            Silakan transfer tepat sesuai total nominal di atas ke pilihan rekening di atas.
          </p>
        </div>

        {/* FORM ISIAN DATA */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Nama Lengkap Pembeli</label>
            <input type="text" required placeholder="Contoh: Budi Santoso" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Nomor WhatsApp Active</label>
            <input type="tel" required placeholder="Contoh: 081234567890" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Alamat Pengiriman Lengkap</label>
            <textarea required rows={3} placeholder="Jalan, No. Rumah, Kecamatan, Kota, Kode Pos" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Catatan Ucapan / Request Pita (Opsional)</label>
            <input type="text" placeholder="Contoh: Tolong tuliskan 'Happy Birthday Rina!'" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Upload Bukti Pembayaran</label>
            <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} style={{ padding: '8px 0' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
            {loading ? 'Sedang Memproses & Mengirim...' : '✅ Kirim Bukti Pembayaran & Notif WA'}
          </button>
        </form>
      </section>
    </div>
  )
}