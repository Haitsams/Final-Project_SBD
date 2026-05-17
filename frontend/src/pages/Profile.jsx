import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [topupAmount, setTopupAmount] = useState('');

  // Fungsi mengambil profil user
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setUser(data.user);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fungsi Top Up Saldo
  const handleTopUp = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseInt(topupAmount) })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Berhasil Top Up Rp ${topupAmount}!`);
        setTopupAmount('');
        fetchProfile(); // Refresh saldo di layar
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <p className="text-center mt-10">Memuat profil...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Halo, {user.username}!</h1>
      
      {/* Kartu Saldo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h2 className="text-xl font-bold mb-4">Informasi Saldo Dompet</h2>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-green-50 p-4 rounded border border-green-200">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-green-700">Rp {parseInt(user.available_balance).toLocaleString('id-ID')}</p>
          </div>
          <div className="flex-1 bg-yellow-50 p-4 rounded border border-yellow-200">
            <p className="text-sm text-gray-600">Hold Balance (Escrow)</p>
            <p className="text-2xl font-bold text-yellow-700">Rp {parseInt(user.hold_balance).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Form Mock Top Up */}
        <form onSubmit={handleTopUp} className="flex gap-2">
          <input 
            type="number" 
            placeholder="Nominal Top Up (cth: 500000)" 
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            className="flex-1 border p-2 rounded outline-none focus:border-blue-500" 
            min="10000"
            required 
          />
          <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 font-bold">
            + Top Up
          </button>
        </form>
      </div>
    </div>
  );
}