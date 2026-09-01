import { useState } from 'react'
import { supabase } from '../lib/supabase'

// DATA PRODUK (Bisa diatur mana yang ada diskon, mana yang harga normal)
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
    price: 120000, // Produk Normal (Tanpa Diskon)
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
  const [cartStep, setCartStep] = useState(1) // Step 1: Keranjang, Step 2: Checkout Form
  
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

      {/* KATALOG PRODUK */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Katalog Produk</h2>
        
        {filteredProducts.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Produk "{search}" tidak ditemukan.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff',