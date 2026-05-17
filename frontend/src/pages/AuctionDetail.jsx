import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AuctionDetail() {
  const { id } = useParams(); 
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidInput, setBidInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);

  const fetchAuctionDetail = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/auctions/${id}`);
      const data = await response.json();
      if (data.success) {
        setAuction(data.auction);
        setBids(data.bids);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAuctionDetail();
  }, [id]);

  useEffect(() => {
    if (!auction) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.end_time).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Waktu Habis! Lelang Ditutup.');
        setIsEnded(true);
        clearInterval(interval);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours} Jam ${minutes} Menit ${seconds} Detik`);
      }
    }, 1000);

    return () => clearInterval(interval); 
  }, [auction]);

  const handleBid = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Anda harus Login terlebih dahulu untuk melakukan penawaran!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/auctions/${id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bid_amount: parseInt(bidInput) }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Berhasil melakukan penawaran!');
        setBidInput('');
        fetchAuctionDetail();
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!auction) return <p className="text-center mt-10">Memuat data lelang...</p>;

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Bagian Kiri: Gambar Barang */}
      <div className="w-full md:w-1/2">
        <img src={auction.image_url} alt={auction.item_name} className="w-full h-96 object-cover rounded border" />
      </div>
      
      {/* Bagian Kanan: Detail, Timer & Form */}
      <div className="flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-2">{auction.item_name}</h1>
        
        {/* Timer Berjalan */}
        <p className={`font-semibold mb-6 ${isEnded ? 'text-gray-500' : 'text-red-600'}`}>
          {isEnded ? timeLeft : `Berakhir dalam: ${timeLeft}`}
        </p>
        
        {/* Kotak Harga */}
        <div className="bg-gray-50 p-6 rounded-lg border mb-6">
          <p className="text-gray-600">Penawaran Tertinggi Saat Ini:</p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            Rp {parseInt(auction.current_highest_bid).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Form Bidding */}
        {!isEnded ? (
          <form className="flex flex-col gap-3 mb-8" onSubmit={handleBid}>
            <label className="font-semibold text-gray-700">Masukkan Penawaran Anda:</label>
            <input 
              type="number" 
              placeholder={`Minimal Rp ${(parseInt(auction.current_highest_bid) + 1).toLocaleString('id-ID')}`} 
              className="border p-3 rounded outline-none focus:border-blue-500" 
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              required 
            />
            <button className="bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition">
              Place Bid (Tawar)
            </button>
          </form>
        ) : (
          <div className="bg-red-50 text-red-600 font-bold p-4 rounded mb-8 text-center border border-red-200">
            Lelang Telah Berakhir
          </div>
        )}

        {/* Riwayat Penawaran */}
        <div>
          <h2 className="text-xl font-bold mb-3 border-b pb-2">Riwayat Penawaran</h2>
          {bids.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada penawaran. Jadilah yang pertama!</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {bids.map((bid, index) => (
                <li key={bid.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border text-sm">
                  <span className="font-semibold text-gray-700">
                    {index === 0 ? 'win ' : ''} {bid.username}
                  </span>
                  <span className="font-bold text-green-700">
                    Rp {parseInt(bid.bid_amount).toLocaleString('id-ID')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}