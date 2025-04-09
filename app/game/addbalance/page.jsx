'use client';

import { useState } from 'react';

export default function AddBalance() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/wallet/topUp/${paymentMethod}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      setIsProcessing(false);

      if (response.ok) {
        alert('Balance added successfully!');
        setIsProcessing(false);

      } else {
        setIsProcessing(false);
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className=" min-h-[70vh] max-w-lg mx-auto p-6 mt-20 bg-slate-400 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Add Balance</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-lg text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="easypaisa"
              checked={paymentMethod === 'easypaisa'}
              onChange={() => setPaymentMethod('easypaisa')}
              className="mr-2 text-black"
            />
            EasyPaisa
          </label>
          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={() => setPaymentMethod('stripe')}
              className="mr-2 text-black"
            />
            Stripe
          </label>
        </div>
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          {isProcessing ? 'Processing...' : 'Top-Up Balance'}
        </button>
      </form>
    </div>
  );
}
