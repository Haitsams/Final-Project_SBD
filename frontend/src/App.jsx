import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AuctionDetail from './pages/AuctionDetail';
import InitiateAuction from './pages/InitiateAuction';

export default function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    window.location.href = '/login';  
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <nav className="bg-white shadow-sm border-b p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-extrabold text-blue-600">BidSmart</Link>
            
            <div className="flex gap-6 font-semibold items-center text-gray-600">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              
              {isLoggedIn ? (
                <>
                  <Link to="/create" className="hover:text-blue-600">Buat Lelang</Link>
                  <Link to="/profile" className="hover:text-blue-600">Profil</Link>
                  <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-1 rounded hover:bg-red-100">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                  Login / Daftar
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto p-6 mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />

            <Route 
              path="/profile" 
              element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/create" 
              element={isLoggedIn ? <InitiateAuction /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}