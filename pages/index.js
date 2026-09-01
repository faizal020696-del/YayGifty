import { useState } from 'react'
import { supabase } from '../lib/supabase'

const PRODUCTS = [
  { id: 1, name: 'Exclusive Gift Box A', originalPrice: 150000, discountPercent: 50, price: 75000, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Luxury Hampers Box B', price: 120000, image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?w=500&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Custom Dried Flower Bouquet', originalPrice: 100000, discountPercent: 50, price: 50000, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60' },
]

// DATA WILAYAH OFFLINE (ANTI-GAGAL / NO CORS)
const WILAYAH_DATA = {
  "DKI Jakarta": {
    "Jakarta Selatan": ["Cilandak", "Jagakarsa", "Kebayoran Baru", "Kebayoran Lama", "Mampang Prapatan", "Pancasari", "Pasar Minggu", "Pesanggrahan", "Setiabudi", "Tebet"],
    "Jakarta Barat": ["Cengkareng", "Grogol Petamburan", "Taman Sari", "Tambora", "Kebon Jeruk", "Kalideres", "Palmerah", "Kembangan"],
    "Jakarta Pusat": ["Cempaka Putih", "Gambir", "Johar Baru", "Kemayoran", "Menteng", "Sawah Besar", "Senen", "Tanah Abang"],
    "Jakarta Timur": ["Cakung", "Ciracas", "Duren Sawit", "Jatinegara", "Kramat Jati", "Makasar", "Matraman", "Pasar Rebo", "Pulo Gadung"],
    "Jakarta Utara": ["Cilincing", "Kelapa Gading", "Koja", "Pademangan", "Penjaringan", "Tanjung Priok"]
  },
  "Banten": {
    "Kota Tangerang Selatan": ["Ciputat", "Ciputat Timur", "Pamulang", "Pondok Aren", "Serpong", "Serpong Utara", "Setu"],
    "Kota Tangerang": ["Batuceper", "Benda", "Cibodas", "Ciledug", "Karangtengah", "Karawaci", "Larangan", "Neglasari", "Periuk", "Pinang", "Tangerang"],
    "Kab. Tangerang": ["Balaraja", "Cikupa", "Curug", "Kelapa Dua", "Kosambi", "Pasar Kemis", "Sepatan", "Teluknaga"],
    "Kota Serang": ["Serang", "Cipocok Jaya", "Curug", "Kasemen", "Taktakan", "Walantaka"],
    "Kota Cilegon": ["Cibeber", "Cilegon", "Citangkil", "Grogol", "Jombang", "Pulomerak"]
  },
  "Jawa Barat": {
    "Kota Bandung": ["Andir", "Astana Anyar", "Antapani", "Arcamanik", "Bandung Kidul", "Coblong", "Cicendo"],
    "Kab. Bogor": ["Cibinong", "Ciawi", "Cisarua", "Cileungsi", "Gunung Putri", "Parung"],
    "Kota Bogor": ["Bogor Barat", "Bogor Selatan", "Bogor Tengah", "Bogor Timur", "Bogor Utara"],
    "Kota Bekasi": ["Bantargebang", "Bekasi Barat", "Bekasi Selatan", "Bekasi Timur", "Bekasi Utara", "Jatiasih", "Pondok Gede"],
    "Kota Depok": ["Beji", "Cilodong", "Cimanggis", "Cinere", "Cipayung", "Pancoran Mas", "Sawangan", "Sukmajaya"]
  },
  "Jawa Tengah": {
    "Kota Semarang": ["Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Pedurungan", "Semarang Selatan"],
    "Kota Surakarta (Solo)": ["Banjarsari", "Jebres", "Laweyan", "Pasar Kliwon", "Serengan"],
    "Kab. Magelang": ["Borobudur", "Muntilan", "Mertoyudan", "Salaman"]
  },
  "DI Yogyakarta": {
    "Kota Yogyakarta": ["Danurejan", "Gondomanan", "Jetis", "Kotagede", "Kraton", "Mantrijeron", "Merggangsan", "Umbulharjo"],
    "Kab. Sleman": ["Depok", "Gamping", "Kalasan", "Mlati", "Ngaglik", "Sleman"]
  },
  "Jawa Timur": {
    "Kota Surabaya": ["Gubeng", "Gunung Anyar", "Jambangan", "Karangpilang", "Mulyorejo", "Rungkut", "Tegalsari", "Wonokromo"],
    "Kota Malang": ["Blimbing", "Kedungkandang", "Klojen", "Lowokwaru", "Sukun"]
  },
  "Bali": {
    "Kota Denpasar": ["Denpasar Barat", "Denpasar Selatan", "Denpasar Timur", "Denpasar Utara"],
    "Kab. Badung": ["Kuta", "Kuta Selatan", "Kuta Utara", "Mengwi"]
  },
  "Sumatera Utara": {
    "Kota Medan": ["Medan Amplas", "Medan Baru", "Medan Helvetia", "Medan Johor", "Medan Kota", "Medan Petisah", "Medan Tembung"]
  },
  "Sulawesi Selatan": {
    "Kota Makassar": ["Biringkanaya", "Bontoala", "Makassar", "Mamajang", "Mariso", "Panakkukang", "Rappocini", "Tamalate", "Ujung Pandang"]
  }
}

export default function Home() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartStep, setCartStep] = useState(1)

  // STATE ALAMAT
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [savedAddress, setSavedAddress] = useState(null)

  const [addrName, setAddrName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrEmail, setAddrEmail] = useState('')
  const [addrLabel, setAddrLabel] = useState('Rumah')
  const [addrDetail, setAddrDetail] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [selectedProv, setSelectedProv] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  // STATE EKSPEDISI & PEMBAYARAN
  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('BCA')
  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleProvChange = (e) => {
    setSelectedProv(e.target.value)
    setSelectedCity('')
    setSelectedDistrict('')
  }

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value)
    setSelectedDistrict('')
  }

  // SIMPAN ALAMAT & HITUNG ONGKIR (ORIGIN: TANGERANG SELATAN)
  const handleSaveAddress = (e) => {
    e.preventDefault()
    if (!selectedProv || !selectedCity || !selectedDistrict) {
      return alert('Mohon pilih Provinsi, Kota, dan Kecamatan secara lengkap!')
    }

    const addressData = {
      name: addrName,
      phone: addrPhone,
      email: addrEmail,
      label: addrLabel,
      detail: addrDetail,
      province: selectedProv,
      city: selectedCity,
      district: selectedDistrict,
      postalCode: postalCode,
    }

    setSavedAddress(addressData)
    setShowAddressModal(false)

    const cityUpper = selectedCity.toUpperCase()
    const provUpper = selectedProv.toUpperCase()

    let options = []

    // A. AREA LOKAL (Tangsel & Jabodetabek)
    if (cityUpper.includes('TANGERANG') || cityUpper.includes('JAKARTA') || cityUpper.includes('DEPOK') || cityUpper.includes('BOGOR') || cityUpper.includes('BEKASI')) {
      options = [
        { id: 'gojek-instant', courier: 'Gojek / Grab', service: 'Instant (1-3 jam)', price: cityUpper.includes('TANGERANG SELATAN') ? 15000 : 30000, etd: '3 Jam' },
        { id: 'sicepat-reg', courier: 'SiCepat', service: 'REG (Reguler)', price: 9000, etd: '1-2 hari' },
        { id: 'jne-reg', courier: 'JNE', service: 'REG (Reguler)', price: 10000, etd: '1-2 hari' },
        { id: 'jnt-ez', courier: 'J&T', service: 'EZ (Express)', price: 10000, etd: '1-2 hari' },
      ]
    } 
    // B. JAWA BARAT & BANTEN
    else if (provUpper.includes('JAWA BARAT') || provUpper.includes('BANTEN')) {
      options = [
        { id: 'jne-reg', courier: 'JNE', service: 'REG', price: 12000, etd: '2-3 hari' },
        { id: 'sicepat-best', courier: 'SiCepat', service: 'BEST (Next Day)', price: 18000, etd: '1 hari' },
        { id: 'jnt-cargo', courier: 'J&T Cargo', service: 'Kargo / Heavy Weight', price: 25000, etd: '3-4 hari' },
      ]
    } 
    // C. JAWA TENGAH, DIY, JAWA TIMUR
    else if (provUpper.includes('JAWA TENGAH') || provUpper.includes('YOGYAKARTA') || provUpper.includes('JAWA TIMUR')) {
      options = [
        { id: 'jne-reg', courier: 'JNE', service: 'REG', price: 18000, etd: '2-3 hari' },
        { id: 'sicepat-reg', courier: 'SiCepat', service: 'REG', price: 17000, etd: '2-3 hari' },
        { id: 'jnt-cargo', courier: 'J&T Cargo', service: 'Kargo Hemat', price: 35000, etd: '4-5 hari' },
      ]
    } 
    // D. LUAR JAWA
    else {
      let basePrice = 30000
      if (provUpper.includes('BALI') || provUpper.includes('SUMATERA')) basePrice = 28000
      if (provUpper.includes('SULAWESI')) basePrice = 38000

      options = [
        { id: 'jne-reg', courier: 'JNE', service: 'REG (Udara)', price: basePrice, etd: '3-5 hari' },
        { id: 'sicepat-gokil', courier: 'SiCepat', service: 'GOKIL (Cargo)', price: Math.round(basePrice * 0.8), etd: '5-7 hari' },
        { id: 'jnt-express', courier: 'J&T Express', service: 'EZ', price: basePrice + 5000, etd: '3-4 hari' },
      ]
    }

    setShippingOptions(options)
    setSelectedShipping(options[0])
  }

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      return existing
        ? prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
        : [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shippingCost = selectedShipping ? selectedShipping.price : 0
  const grandTotal = subtotal + shippingCost
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (!savedAddress) return alert('Mohon isi alamat pengiriman!')
    if (!selectedShipping) return alert('Mohon pilih pengiriman!')
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
      const fullAddressString = `[${savedAddress.label}] ${savedAddress.name} (${savedAddress.phone}) - ${savedAddress.detail}, ${savedAddress.district}, ${savedAddress.city}, ${savedAddress.province} ${savedAddress.postalCode ? `(${savedAddress.postalCode})` : ''} | Ekspedisi: ${selectedShipping.courier} ${selectedShipping.service} | Catatan: ${note || '-'}`

      const { error: dbError } = await supabase.from('orders').insert([
        {
          customer_name: savedAddress.name,
          customer_phone: savedAddress.phone,
          shipping_address: `${fullAddressString} | Items: ${itemSummary}`,
          total_price: grandTotal,
          proof_url: proofUrl,
          status: 'pending',
        },
      ])

      if (dbError) throw dbError

      alert('Pesanan Anda berhasil dikirim! Pengiriman dari Tangerang Selatan.')
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎁</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#008b9b' }}>YayGifty</span>
          </div>

          <button onClick={() => { setCartStep(1); setIsCartOpen(true) }} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}>
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

      {/* DRAWER KERANJANG */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                  📍 Pengiriman dari Toko: <strong>Tangerang Selatan</strong>
                </div>

                {/* 1. ALAMAT */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px' }}>1. Tujuan Pengiriman</div>
                  {savedAddress ? (
                    <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                      <div style={{ fontWeight: '700' }}>[{savedAddress.label}] {savedAddress.name} ({savedAddress.phone})</div>
                      <div>{savedAddress.detail}</div>
                      <div>Kec. {savedAddress.district}, {savedAddress.city}, {savedAddress.province} {savedAddress.postalCode ? `(${savedAddress.postalCode})` : ''}</div>
                      <button onClick={() => setShowAddressModal(true)} style={{ marginTop: '8px', color: '#008b9b', background: 'none', border: 'none', fontWeight: '700', padding: 0, cursor: 'pointer' }}>Ganti Alamat</button>
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

                {/* 2. PRODUK */}
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '12px' }}>2. Produk Dipesan</div>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <img src={item.image} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.qty} barang</div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Rp{item.price.toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. EKSPEDISI */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px' }}>3. Pilih Ekspedisi & Ongkir</div>
                  {!savedAddress ? (
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Isi alamat pengiriman untuk melihat harga ongkir.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {shippingOptions.map((opt) => (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: selectedShipping?.id === opt.id ? '2px solid #008b9b' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: selectedShipping?.id === opt.id ? '#f0fdf4' : '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" name="shipping" checked={selectedShipping?.id === opt.id} onChange={() => setSelectedShipping(opt)} />
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{opt.courier} - {opt.service}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Estimasi: {opt.etd}</div>
                            </div>
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Rp{opt.price.toLocaleString('id-ID')}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. TOTAL */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '12px' }}>4. Ringkasan Pembayaran</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Total Subtotal Produk</span>
                    <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <span>Biaya Pengiriman</span>
                    <span>{selectedShipping ? `Rp${shippingCost.toLocaleString('id-ID')}` : 'Rp0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.05rem', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                    <span>Total Pembayaran</span>
                    <span>Rp{grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!savedAddress) return alert('Pilih alamat pengiriman dulu!')
                    if (!selectedShipping) return alert('Pilih opsi ekspedisi pengiriman dulu!')
                    setCartStep(3)
                  }}
                  style={{ width: '100%', background: '#008b9b', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}
                >
                  Lanjut ke Pembayaran ➔
                </button>
              </div>
            )}

            {/* STEP 3: PEMBAYARAN */}
            {cartStep === 3 && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Bayar:</span>
                    <strong style={{ color: '#008b9b', fontSize: '1.1rem' }}>Rp{grandTotal.toLocaleString('id-ID')}</strong>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Rekening Tujuan</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}>
                      <option value="BCA">BCA (123-456-7890 a.n YayGifty)</option>
                      <option value="Mandiri">Mandiri (987-000-1111 a.n YayGifty)</option>
                      <option value="QRIS">QRIS All Payment (0812-3456-7890)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Catatan Pesanan (Opsional)</label>
                    <input type="text" placeholder="Misal: Tulisan di kartu ucapan..." value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Upload Struk / Bukti Transfer</label>
                    <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} style={{ marginTop: '6px', display: 'block' }} />
                  </div>

                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                    {loading ? 'Mengirim Pesanan...' : 'Konfirmasi & Selesaikan Pesanan'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ALAMAT PENERIMA */}
      {showAddressModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Alamat Penerima Baru</h3>
              <button onClick={() => setShowAddressModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Nama Lengkap Penerima" required value={addrName} onChange={(e) => setAddrName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <input type="tel" placeholder="Nomor Telepon / WhatsApp" required value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <input type="email" placeholder="Email (Opsional)" value={addrEmail} onChange={(e) => setAddrEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />

              <select value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="Rumah">Rumah</option>
                <option value="Kantor">Kantor</option>
                <option value="Apartemen">Apartemen</option>
              </select>

              <textarea placeholder="Alamat Detail (Jalan, Nomor Rumah, RT/RW, Patokan)" required rows={2} value={addrDetail} onChange={(e) => setAddrDetail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />

              {/* 1. SELECT PROVINSI */}
              <select required value={selectedProv} onChange={handleProvChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Provinsi --</option>
                {Object.keys(WILAYAH_DATA).map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>

              {/* 2. SELECT KOTA / KABUPATEN */}
              <select required disabled={!selectedProv} value={selectedCity} onChange={handleCityChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kota / Kabupaten --</option>
                {selectedProv && Object.keys(WILAYAH_DATA[selectedProv]).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* 3. SELECT KECAMATAN */}
              <select required disabled={!selectedCity} value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">-- Pilih Kecamatan --</option>
                {selectedProv && selectedCity && WILAYAH_DATA[selectedProv][selectedCity].map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>

              {/* 4. INPUT KODE POS */}
              <input type="text" placeholder="Kode Pos (Contoh: 15412)" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />

              <button type="submit" style={{ padding: '12px', background: '#008b9b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Simpan & Hitung Ongkir
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}