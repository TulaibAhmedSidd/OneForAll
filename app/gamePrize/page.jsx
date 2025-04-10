'use client';

import { useEffect, useState } from 'react';

export default function GamePrizesPage() {
  const [prizes, setPrizes] = useState([]);
  const [form, setForm] = useState({
    prizeName: '',
    imageUrl: '',
    prizeWorth: '',
    quantity: '',
    gameId: '',
  });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing prizes
  const fetchPrizes = async () => {
    try {
      const res = await fetch('/api/game-prize/get-all');
      const data = await res.json();
      if (res.ok) {
        setPrizes(data.prizes);
      } else {
        setError(data.error || 'Failed to fetch prizes');
      }
    } catch (err) {
      console.error(err);
      setError('Server error fetching prizes.');
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Cloudinary image upload
  const handleImageUpload = async (e) => {
    setLoading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset');  // Replace with your Cloudinary preset

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setForm((prevState) => ({ ...prevState, imageUrl: data.secure_url }));
      } else {
        setError('Failed to upload image.');
      }
    } catch (err) {
      console.error(err);
      setError('Error uploading image.');
    } finally {
      setLoading(false);
    }
  };
  const handleImageUploadAPI = async (e) => {
    setLoading(true);
    setError('');
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
  
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: data.secure_url }));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('Upload error');
    } finally {
      setLoading(false);
    }
  };
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in.');
      return;
    }

    const newPrize = { ...form, createdAt: new Date() };

    try {
      const res = await fetch(`/api/game-prize${editingId ? `/update/${editingId}` : '/create'}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPrize),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save prize');
      } else {
        setForm({ prizeName: '', imageUrl: '', prizeWorth: '', quantity: '', gameId: '' });
        setEditingId(null);
        fetchPrizes();
      }
    } catch (err) {
      console.error(err);
      setError('Error submitting form.');
    }
  };

  // Edit prize
  const handleEdit = (prize) => {
    setForm({
      prizeName: prize?.prizeName,
      imageUrl: prize?.imageUrl,
      prizeWorth: prize?.prizeWorth,
      quantity: prize?.quantity,
      gameId: prize?.gameId,
    });
    setEditingId(prize?._id);
  };

  // Delete prize
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this prize?')) return;

    try {
      const res = await fetch(`/api/game-prize/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to delete prize');
      } else {
        fetchPrizes();
      }
    } catch (err) {
      console.error(err);
      setError('Error deleting prize?.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Manage Game Prizes</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-10 bg-white shadow-md rounded p-6">
        <input
          type="text"
          name="prizeName"
          placeholder="Prize Name"
          value={form.prizeName}
          onChange={handleChange}
          className="w-full p-2 text-blue-950 border rounded"
        />
        <input
          type="file"
          name="imageUrl"
          onChange={handleImageUploadAPI}
          className="w-full p-2 text-blue-950 border rounded"
        />
        {loading && <p className='text-black'>Uploading image...</p>}
        <input
          type="number"
          name="prizeWorth"
          placeholder="Prize prizeWorth (PKR)"
          value={form.prizeWorth}
          onChange={handleChange}
          className="w-full p-2 text-blue-950 border rounded"
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          className="w-full p-2 text-blue-950 border rounded"
        />
        <input
          type="text"
          name="gameId"
          placeholder="Game ID"
          value={form.gameId}
          onChange={handleChange}
          className="w-full p-2 text-blue-950 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {editingId ? 'Update Prize' : 'Create Prize'}
        </button>
      </form>

      <div className="space-y-4">
        {prizes.map((prize) => (
          <div
            key={prize?._id}
            className="flex items-center justify-between bg-gray-100 p-4 rounded shadow"
          >
            <div>
              <p className='text-blue-950 font-bold'  >{prize?.prizeName}</p>
              <p className='text-blue-950' >prizeWorth: ₨{prize?.prizeWorth}</p>
              <p className='text-blue-950' >Quantity: {prize?.quantity}</p>
              {prize?.gameId && <p>Game ID: {prize?.gameId}</p>}
            </div>
            <img src={prize?.prizeImage} alt={prize?.prizeName} className="h-16 w-16 object-cover rounded" />
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(prize)}
                className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(prize?._id)}
                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
