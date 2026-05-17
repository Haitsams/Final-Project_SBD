import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState(''); 

  const BACKEND_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auctions`;

  const fetchAuctions = async () => {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('search', keyword);
      if (category) params.append('category', category); // Hanya mengirim parameter search dan category

      const url = params.toString() ? `${BACKEND_URL}?${params.toString()}` : BACKEND_URL;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAuctions(data.auctions);
      }
    } catch (error) {
      console.error("Gagal mengambil data lelang:", error);
    }
  };

  // Hanya berjalan ulang secara otomatis jika kategori diubah oleh user
  useEffect(() => {
    fetchAuctions();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault(); 
    fetchAuctions();
  }; 

  const handleResetFilter = () => {
    setKeyword('');
    setCategory(''); // Membersihkan reset status yang tidak terpakai
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* BAGIAN ATAS: Judul & Form Pencarian */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
        <h1 className="text-3xl font-bold">Lelang Berlangsung</h1>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-1/3">
          <input 
            type="text" 
            placeholder="Cari barang (cth: sepatu jordan)..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border border-r-0 rounded-l-lg p-2 outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 font-semibold transition-colors">
            Cari
          </button>
        </form>
      </div>

      {/* LAYOUT UTAMA: Filter di Kiri, Grid Lelang di Kanan */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* PANEL FILTER SIDEBAR */}
        <div className="w-full md:w-64 border bg-white rounded-lg p-4 shadow-sm h-fit space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-lg text-gray-800">Filter</h3>
            <button 
              onClick={handleResetFilter} 
              className="text-xs text-red-500 hover:underline font-medium"
            >
              Reset Semua
            </button>
          </div>

          {/* Filter Kategori */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Kategori</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded-md outline-none bg-gray-50 focus:bg-white focus:border-blue-500 text-sm"
            >
              <option value="">Semua Kategori</option>
              <option value="sepatu">Sepatu</option>
              <option value="pakaian">Pakaian</option>
              <option value="elektronik">Elektronik</option>
              <option value="koleksi">Barang Koleksi</option>
            </select>
          </div>
        </div>

        {/* CONTAINER HASIL LELANG */}
        <div className="flex-1">
          {auctions.length === 0 ? (
            <div className="bg-gray-50 border border-dashed rounded-lg p-10 text-center text-gray-500">
              Belum ada barang yang dilelang atau tidak ditemukan dengan filter tersebut.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((item) => (
                <div key={item.id} className="border bg-white rounded-lg p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <img src={item.image_url} alt={item.item_name} className="w-full h-48 object-cover rounded mb-4 bg-gray-200" />
                  <h2 className="text-xl font-bold truncate text-gray-800">{item.item_name}</h2>
                  
                  <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider bg-gray-100 w-fit px-2 py-0.5 rounded">
                    {item.category || 'Kategori'}
                  </p>
                  
                  <p className="text-gray-600 mt-3 text-sm">Bid Tertinggi:</p>
                  <p className="font-bold text-green-600 text-xl">Rp {parseInt(item.current_highest_bid || item.starting_price).toLocaleString('id-ID')}</p>
                  
                  <p className="text-xs text-red-500 mb-4 mt-2 font-medium">
                    Berakhir: {new Date(item.end_time).toLocaleString('id-ID')}
                  </p>
                  
                  <div className="mt-auto pt-2">
                    <Link to={`/auction/${item.id}`} className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                      Lihat Detail & Bid
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}