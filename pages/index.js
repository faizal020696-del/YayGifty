import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// DATA DUMMY WILAYAH INDONESIA
const REGIONS = {
  'DKI Jakarta': {
    'Jakarta Selatan': {
      'Kebayoran Baru': '12110',
      'Cilandak': '12430',
      'Tebet': '12810'
    },
    'Jakarta Barat': {
      'Kebon Jeruk': '11530',
      'Palmerah': '11480'
    }
  },
  'Jawa Barat': {
    'Bandung': {
      'Coblong': '40132',
      'Cicendo': '40171'
    },
    'Bogor': {
      'Bogor Tengah': '16121',
      'Bogor Selatan': '16131'
    }
  },
  'Jawa Timur': {
    'Surabaya': {
      'Tegalsari': '60261',
      'Gubeng': '60281'
    }
  }
}

// OPTIONS EKSPEDISI
const SHIPPING_OPTIONS = [
  { id: 'jne-reg', courier: 'JNE', service: 'Reguler', price: 12000, etd: '2-3 hari' },
  { id: 'sicepat-best', courier: 'SiCepat', service: 'BEST (Next Day)', price: 18000, etd: '1 hari' },
  { id: 'gojek-instant', courier: 'Gojek/Grab', service: 'Instant', price: 35000, etd: '3-4 jam' },
  { id: 'jnt-cargo', courier: 'J&T Cargo', service: 'Kargo (Hemat)', price: 45000, etd: '3-5 hari' },
]

const PRODUCTS = [
  { id: 1, name: 'Exclusive Gift Box A', originalPrice: 150000, discountPercent: 50, price: 75000, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Luxury Hampers Box B', price: 120000, image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?w=500&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Custom Dried Flower Bouquet', originalPrice: 100000, discountPercent: 50, price: 50000, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60' },
]

export default function Home() {
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartStep, setCartStep] = useState(1) // 1: Keranjang, 2: Review Pesanan, 3: Pembayaran

  // STATE ALAMAT PENGIRIMAN
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [savedAddress, setSavedAddress] = useState(null)
  
  const [addrName, setAddrName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrEmail, setAddrEmail] = useState('')
  const [addrLabel, setAddrLabel] = useState('Rumah')
  const [addrDetail, setAddrDetail] = useState('')
  const [selectedProv, setSelectedProv] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [postalCode, setPostalCode] = useState('')

  // STATE EKSPEDISI & PEMBAYARAN
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('BCA')
  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Auto-fill Kode Pos ketika Kecamatan dipilih
  useEffect(() => {
    if (selectedProv && selectedCity && selectedDistrict) {
      const code = REGIONS[selectedProv]?.[selectedCity]?.[selectedDistrict] || ''
      setPostalCode(code)
    } else {
      setPostalCode('')
    }
  }, [selectedProv, selectedCity, selectedDistrict])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      return existing
        ? prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta
          return newQty > 0 ? { ...item, qty: newQty } : null
        }
        return item
      }).filter(Boolean)
    )
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shippingCost = selectedShipping ? selectedShipping.price : 0
  const grandTotal = subtotal + shippingCost
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  const handleSaveAddress = (e) => {
    e.preventDefault()
    setSavedAddress({
      name: addrName,
      phone: addrPhone,
      email: addrEmail,
      label: addrLabel,
      detail: addrDetail,
      province: selectedProv,
      city: selectedCity,
      district: selectedDistrict,
      postalCode: postalCode
    })
    setShowAddressModal(false)
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (!savedAddress) return alert('Mohon isi alamat pengiriman terlebih dahulu!')
    if (!selectedShipping) return alert('Mohon pilih metode pengiriman!')
    if (!file) return alert('Mohon upload bukti pembayaran!')

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: storageError } = await supabase.storage.from('payment-proofs').upload(fileName, file)
      if (storageError) throw storageError

      const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)
      const proofUrl = publicUrlData.publicUrl

      const itemSummary = cart.map((i) => `${i.name} (x${i.qty})`).join(', ')
      const fullAddressString = `[${savedAddress.label}] ${savedAddress.name} (${savedAddress.phone}) - ${savedAddress.detail}, ${savedAddress.district}, ${savedAddress.city}, ${savedAddress.province} ${savedAddress.postalCode}`

      const { error: dbError } = await supabase.from('orders').insert([{
        customer_name: savedAddress.name,
        customer_phone: savedAddress.phone,
        shipping_address: `${fullAddressString} | Ekspedisi: ${selectedShipping.courier} ${selectedShipping.service} | Catatan: ${note || '-'} | Items: ${itemSummary}`,
        total_price: grandTotal,
        proof_url: proofUrl,
        status: 'pending'
      }])

      if (dbError) throw dbError

      alert('Pesanan berhasil dibuat! Terima kasih telah berbelanja.')
      setCart([])
      setIsCartOpen(false)
      setCartStep(1)
      setSavedAddress(null)
      setSelectedShipping(null)
    } catch (err) {
      alert('Gagal mengirim pesanan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1f2937', minHeight: '100vh', background: '#f9fafb' }}>
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎁</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#008b9b' }}>YayGifty</span>
          </div>

          <button onClick={() => { setCartStep(1); setIsCartOpen(true); }} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <span style={{ fontSize: '1.6rem' }}>🛒</span>
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '9999px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* KATALOG */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Katalog Produk</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {PRODUCTS.map((product) => (
            <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px' }}>{product.name}</h3>
                <div style={{ marginBottom: '16px' }}>
                  {product.originalPrice && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'line-through' }}>Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', padding: '1px 4px' }}>{product.discountPercent}%</span>
                    </div>
                  )}
                  <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#008b9b' }}>Rp {product.price.toLocaleString('id-ID')}</span>
                </div>
                <button onClick={() => addToCart(product)} style={{ width: '100%', padding: '10px', background: '#008b9b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  + Tambah ke Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* DRAWER KERANJANG & CHECKOUT */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* DRAWER HEADER */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {cartStep > 1 && (
                  <button onClick={() => setCartStep(cartStep - 1)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>←</button>
                )}
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                  {cartStep === 1 ? 'Keranjang' : cartStep === 2 ? 'Review Pesanan' : 'Pembayaran'}
                </h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            {/* STEP 1: KERANJANG */}
            {cartStep === 1 && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                  {cart.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>Keranjang kosong</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <img src={item.image} style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.name}</div>
                          <div style={{ color: '#008b9b', fontWeight: '700', fontSize: '0.9rem', margin: '4px 0' }}>Rp{item.price.toLocaleString('id-ID')}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => updateQty(item.id, -1)} style={{ padding: '2px 8px', border: '1px solid #ccc' }}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} style={{ padding: '2px 8px', border: '1px solid #ccc' }}>+</button>
                            <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Belanja</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>Rp{subtotal.toLocaleString('id-ID')}</div>
                    </div>
                    <button onClick={() => setCartStep(2)} style={{ background: '#008b9b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                      Review Pesanan
                    </button>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: REVIEW PESANAN */}
            {cartStep === 2 && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* STEP INDICATOR */}
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                  <span style={{ color: '#008b9b' }}>1 Review Order</span>
                  <span style={{ color: '#9ca3af' }}>➔ 2 Pengiriman</span>
                  <span style={{ color: '#9ca3af' }}>➔ 3 Pembayaran</span>
                </div>

                {/* 1. ALAMAT PENGIRIMAN */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px' }}>Tujuan Pengiriman</div>
                  {savedAddress ? (
                    <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                      <div style={{ fontWeight: '700' }}>[{savedAddress.label}] {savedAddress.name} ({savedAddress.phone})</div>
                      <div>{savedAddress.detail}</div>
                      <div>{savedAddress.district}, {savedAddress.city}, {savedAddress.province} - {savedAddress.postalCode}</div>
                      <button onClick={() => setShowAddressModal(true)} style={{ marginTop: '8px', color: '#008b9b', background: 'none', border: 'none', fontWeight: '700', padding: 0, cursor: 'pointer' }}>Ubah Alamat</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Mohon isi alamat Anda</span>
                      <button onClick={() => setShowAddressModal(true)} style={{ background: '#008b9b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                        Tambah
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. DAFTAR BELANJA */}
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '12px' }}>Daftar Belanja</div>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <img src={item.image} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.qty} barang</div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Rp{item.price.toLocaleString('id-ID')}/barang</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. PILIH PENGIRIMAN */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px' }}>Pilih Pengiriman</div>
                  {!savedAddress ? (
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Lengkapi alamat untuk melihat ongkir.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {SHIPPING_OPTIONS.map((opt) => (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: selectedShipping?.id === opt.id ? '#f0fdf4' : '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" name="shipping" checked={selectedShipping?.id === opt.id} onChange={() => setSelectedShipping(opt)} />
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{opt.courier} - {opt.service}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Estimasi {opt.etd}</div>
                            </div>
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Rp{opt.price.toLocaleString('id-ID')}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. RINGKASAN PEMBAYARAN */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '12px' }}>Ringkasan Pembayaran</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Total Harga ({totalItems} barang)</span>
                    <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <span>Biaya Pengiriman</span>
                    <span>{selectedShipping ? `Rp${shippingCost.toLocaleString('id-ID')}` : 'Gratis / belum dipilih'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.05rem', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                    <span>Total Pembayaran</span>
                    <span>Rp{grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* 5. LANJUT PEMBAYARAN */}
                <button
                  onClick={() => {
                    if (!savedAddress) return alert('Isi alamat dulu bro!')
                    if (!selectedShipping) return alert('Pilih ekspedisi dulu bro!')
                    setCartStep(3)
                  }}
                  style={{ width: '100%', background: '#008b9b', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}
                >
                  Pilih Pembayaran
                </button>
              </div>
            )}

            {/* STEP 3: FORM TRANSFER & UPLOAD BUKTI */}
            {cartStep === 3 && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Harus Dibayar:</span>
                    <strong style={{ color: '#008b9b' }}>Rp{grandTotal.toLocaleString('id-ID')}</strong>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Metode Transfer</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option value="BCA">BCA (123-456-7890 a.n YayGifty)</option>
                      <option value="Mandiri">Mandiri (987-000-1111 a.n YayGifty)</option>
                      <option value="QRIS">QRIS / E-Wallet (0812-3456-7890)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Catatan Ucapan (Opsional)</label>
                    <input type="text" placeholder="Ucapan kartu..." value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Upload Bukti Pembayaran</label>
                    <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} style={{ marginTop: '6px', display: 'block' }} />
                  </div>

                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {loading ? 'Mengirim...' : 'Bayar Sekarang & Selesaikan Pesanan'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL TAMBAH ALAMAT */}
      {showAddressModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Tambah Alamat Baru</h3>
              <button onClick={() => setShowAddressModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Nama Penerima" required value={addrName} onChange={(e) => setAddrName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <input type="tel" placeholder="Nomor Telepon" required value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <input type="email" placeholder="Email (Opsional)" value={addrEmail} onChange={(e) => setAddrEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              
              <select value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="Rumah">Rumah</option>
                <option value="Kantor">Kantor</option>
                <option value="Apartemen">Apartemen</option>
              </select>

              <textarea placeholder="Alamat Lengkap (Jalan, No. Rumah, RT/RW)" required rows={2} value={addrDetail} onChange={(e) => setAddrDetail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />

              {/* DROPDOWN PROVINSI */}
              <select required value={selectedProv} onChange={(e) => { setSelectedProv(e.target.value); setSelectedCity(''); setSelectedDistrict(''); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Provinsi --</option>
                {Object.keys(REGIONS).map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>

              {/* DROPDOWN KOTA */}
              <select required disabled={!selectedProv} value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedDistrict(''); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kota / Kabupaten --</option>
                {selectedProv && Object.keys(REGIONS[selectedProv]).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* DROPDOWN KECAMATAN */}
              <select required disabled={!selectedCity} value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kecamatan --</option>
                {selectedCity && Object.keys(REGIONS[selectedProv][selectedCity]).map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>

              {/* AUTO GENERATE KODE POS */}
              <input type="text" placeholder="Kode Pos (Otomatis)" readOnly value={postalCode} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: '#f3f4f6' }} />

              <button type="submit" style={{ padding: '12px', background: '#008b9b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Simpan Alamat
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}