import { useState } from 'react'
import { supabase } from '../lib/supabase'

const PRODUCTS = [
  { 
    id: 1, 
    name: 'Exclusive Gift Box A', 
    originalPrice: 150000,
    discountPercent: 50,
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
    originalPrice: 100000,
    discountPercent: 50,
    price: 50000, 
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60' 
  },
]

export default function Home() {
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartStep, setCartStep] = useState(1)
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BCA')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const openCartDrawer = () => {
    setCartStep(1)
    setIsCartOpen(true)
  }

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
      setCartStep(1)
    } catch (error) {
      alert('Gagal mengirim pesanan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1f2937', minHeight: '100vh', background: '#f9fafb' }}>
      
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.8rem' }}>🎁</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '-0.05em' }}>YayGifty</span>
          </div>

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

          <button
            onClick={openCartDrawer}
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

      {/* KATALOG */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Katalog Produk</h2>
        
        {filteredProducts.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Produk tidak ditemukan.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px' }}>{product.name}</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    {product.originalPrice && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                          Rp {product.originalPrice.toLocaleString('id-ID')}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', padding: '1px 4px' }}>
                          {product.discountPercent}%
                        </span>
                      </div>
                    )}
                    <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#4f46e5' }}>
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </div>

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

      {/* DRAWER KERANJANG */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', maxWidth: '450px', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {cartStep === 2 ? (
                  <button onClick={() => setCartStep(1)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', padding: 0 }}>←</button>
                ) : (
                  <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', padding: 0 }}>←</button>
                )}
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                  {cartStep === 1 ? 'Keranjang' : 'Detail Pembayaran'}
                </h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            {cartStep === 1 && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '700' }}>Barang-Barang Kamu</h4>
                  
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                      <p style={{ fontSize: '3rem', margin: '0 0 8px' }}>🛒</p>
                      <p style={{ fontStyle: 'italic', margin: 0 }}>Keranjang belanjaan kamu kosong nih.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
                        
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e5e7eb' }} 
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111827', marginBottom: '4px' }}>{item.name}</div>
                            
                            {item.originalPrice ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                                  Rp {item.originalPrice.toLocaleString('id-ID')}
                                </span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', padding: '1px 4px' }}>
                                  {item.discountPercent}%
                                </span>
                              </div>
                            ) : null}

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                              <span style={{ background: '#b91c1c', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '1.05rem' }}>
                                Rp{item.price.toLocaleString('id-ID')}
                              </span>
                              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>/barang</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Harga Total: </span>
                            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>
                              Rp{(item.price * item.qty).toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              style={{ border: 'none', background: '#f3f4f6', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
                            >
                              🗑️
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                              <button onClick={() => updateQty(item.id, -1)} style={{ width: '32px', height: '32px', background: '#e5e7eb', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                              <span style={{ width: '36px', textAlign: 'center', fontWeight: '600', fontSize: '0.95rem' }}>{item.qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} style={{ width: '32px', height: '32px', background: '#fff', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', color: '#0891b2' }}>+</button>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Belanja</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827' }}>
                        Rp{totalPrice.toLocaleString('id-ID')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Belum termasuk ongkir</div>
                    </div>

                    <button
                      onClick={() => setCartStep(2)}
                      style={{
                        background: '#008b9b',
                        color: '#fff',
                        border: 'none',
                        padding: '14px 24px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      Review Pesanan
                    </button>
                  </div>
                )}
              </>
            )}

            {cartStep === 2 && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Total Harus Dibayar:</span>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#4f46e5' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Pilih Bank / Metode Transfer</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option value="BCA">BCA (123-456-7890 a.n YayGifty)</option>
                      <option value="Mandiri">Mandiri (987-000-1111 a.n YayGifty)</option>
                      <option value="QRIS">QRIS / E-Wallet (0812-3456-7890)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Nama Lengkap Pembeli</label>
                    <input type="text" required placeholder="Contoh: Budi Santoso" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Nomor WhatsApp Active</label>
                    <input type="tel" required placeholder="Contoh: 081234567890" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Alamat Pengiriman Lengkap</label>
                    <textarea required rows={3} placeholder="Jalan, No. Rumah, Kecamatan, Kota" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Catatan Ucapan (Opsional)</label>
                    <input type="text" placeholder="Contoh: Tolong beri kartu ucapan" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Upload Bukti Pembayaran</label>
                    <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} style={{ marginTop: '4px', display: 'block' }} />
                  </div>

                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}>
                    {loading ? 'Mengirim...' : 'Bayar Sekarang & Kirim Pesanan'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}