import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InitiateAuction() {
  const [itemName, setItemName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [duration, setDuration] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          item_name: itemName,
          image_url: imageUrl,
          start_price: parseInt(startPrice),
          duration_minutes: parseInt(duration)
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Lelang berhasil dibuat!');
        navigate('/'); // Pindah ke Home
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Buat Lelang Baru</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-semibold">Nama Barang</label>
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border p-2 rounded" placeholder="Misal: Sepatu Nike" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">URL Gambar Barang</label>
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border p-2 rounded" placeholder="https://..." required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Harga Awal (Rp)</label>
          <input type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} className="w-full border p-2 rounded" placeholder="100000" min="1" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Durasi Lelang (Menit)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border p-2 rounded" placeholder="60" min="1" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700 font-bold">
          Mulai Lelang
        </button>
      </form>
    </div>
  );
}