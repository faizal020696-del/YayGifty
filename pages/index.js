import { useState } from 'react'
import { supabase } from '../lib/supabase'

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
  const [search, setSearch] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BCA')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Tambah item ke keranjang (Tanpa buka pop-up otomatis)
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

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  const filteredProducts = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

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

      alert('Pesanan berhasil terkirim! Terima kasih sudah berbelanja di YayGifty.')

      setCart([])
      setName('')
      setPhone('')
      setAddress('')
      setNote('')
      setFile(null)
      setIsCartOpen(false)
    } catch (error) {
      alert('Gagal mengirim pesanan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1f2937', minHeight: '100vh', background: '#f9fafb' }}>
      
      {/* HEADER STICKY */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.8rem' }}>🎁</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '-0.05em' }}>YayGifty</span>
          </div>

          {/* SEARCH BAR */}
          <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
            <input
              type="text"
              placeholder="Cari hampers atau kado spesial di YayGifty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '9999px',
                border: '1px solid #e5e7eb',
                background: '#f3f4f6',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* IKON KERANJANG DI KANAN ATAS */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
          >
            <span style={{ fontSize: '1.6rem' }}>🛒</span>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '9999px',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* KATALOG PRODUK */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Katalog Produk</h2>
        
        {filteredProducts.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Produk "{search}" tidak ditemukan.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
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
        )}
      </main>

      {/* PANEL SLIDE KERANJANG */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', maxWidth: '450px', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}>
            
            {/* HEADER PANEL */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>🛒 Keranjang & Pembayaran</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* BODY PANEL */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px' }}>Item Pesanan:</h4>
                {cart.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Keranjang kamu kosong.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', gap: '12px' }}>
                      
                      {/* GAMBAR MINI PRODUK (THUMBNAIL) */}
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                      />

                      {/* INFORMASI PRODUK */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1f2937' }}>{item.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>Rp {item.price.toLocaleString('id-ID')}</div>
                      </div>

                      {/* TOMBOL QTY & HAPUS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: '24px', height: '24px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: '24px', height: '24px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '4px', fontSize: '0.9rem' }}>✕</button>
                      </div>

                    </div>
                  ))
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <span>Total Bayar:</span>
                  <span style={{ color: '#4f46e5' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {cart.length > 0 && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '2px dashed #e5e7eb', paddingTop: '16px' }}>
                  <h4 style={{ margin: 0 }}>Detail Pembayaran & Pengiriman</h4>
                  
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Metode Transfer</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '4px' }}>
                      <option value="BCA">BCA (123-456-7890 a.n YayGifty)</option>
                      <option value="Mandiri">Mandiri (987-000-1111 a.n YayGifty)</option>
                      <option value="QRIS">QRIS / E-Wallet (0812-3456-7890)</option>
                    </select>
                  </div>

                  <input type="text" required placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  <input type="tel" required placeholder="Nomor WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  <textarea required rows={2} placeholder="Alamat Pengiriman Lengkap" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  <input type="text" placeholder="Catatan Ucapan (Opsional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Upload Bukti Pembayaran</label>
                    <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} style={{ marginTop: '4px', display: 'block' }} />
                  </div>

                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                    {loading ? 'Mengirim...' : 'Bayar Sekarang'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}