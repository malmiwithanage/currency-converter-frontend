'use client';

import { useState, useEffect } from "react";

interface Transaction {
  _id: string;
  fromCountry: string;
  toCountry: string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  amount: number;
  convertedAmount: number;
  date: string;
  time: string;
}

export default function Home() {
  const countries = [
    { name: "USA", code: "USD" },
    { name: "Canada", code: "CAD" },
    { name: "UK", code: "GBP" },
    { name: "India", code: "INR" },
    { name: "Sri Lanka", code: "LKR" },
  ];

  const [fromCountry, setFromCountry] = useState(countries[0].code);
  const [toCountry, setToCountry] = useState(countries[1].code);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [amount, setAmount] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [history, setHistory] = useState<Transaction[]>([]);

  // Fetch workout history from the backend when the component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('https://currency-converter-backend-vercel-fix.vercel.app/api/workouts');
        const data = await response.json();
        setHistory(data); // Update history state with the fetched data
      } catch (error) {
        console.error('Error fetching workout history:', error);
      }
    };

    fetchHistory();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch exchange rate from API when the selected currencies change
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
        const data = await response.json();

        if (data.rates && data.rates[toCurrency]) {
          setExchangeRate(data.rates[toCurrency]);
          setConvertedAmount(amount * data.rates[toCurrency]);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency, amount]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    // Data to be sent to the backend
    const transactionData = {
      fromCountry,
      toCountry,
      fromCurrency,
      toCurrency,
      exchangeRate,
      amount,
      convertedAmount,
      date: currentDate,
      time: currentTime,
    };

    try {
      // Send the data to the backend API via a POST request
      const response = await fetch('https://currency-converter-backend-vercel-fix.vercel.app/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const workout = await response.json();
        console.log('Workout created successfully:', workout);
        // Optionally, you can update the local history immediately after submitting
        setHistory([workout, ...history]);
      } else {
        console.error('Error creating workout:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating workout:', error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputAmount = parseFloat(e.target.value);
    setAmount(inputAmount);
    setConvertedAmount(inputAmount * exchangeRate); // Recalculate converted amount based on the new amount
  };

  // Function to handle deletion of a workout
  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`https://currency-converter-backend-vercel-fix.vercel.app/api/workouts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted transaction from the local history state
        setHistory(history.filter((transaction) => transaction._id !== id));
        console.log('Transaction deleted');
      } else {
        console.error('Error deleting transaction:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="grid place-items-center min-h-screen p-8 bg-gray-100">
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md space-y-4"
      >
        <h1 className="text-3xl font-semibold text-center text-black mb-6">
          Currency Conversion Form
        </h1>

        <div className="grid gap-4">
          <div>
            <label htmlFor="fromCountry" className="block text-sm font-medium text-black">
              From Country
            </label>
            <select
              id="fromCountry"
              value={fromCountry}
              onChange={(e) => {
                const selectedCountry = countries.find(
                  (country) => country.code === e.target.value
                );
                setFromCountry(e.target.value);
                setFromCurrency(selectedCountry?.code || '');
              }}
              className="mt-1 block w-full p-2 border rounded-md text-black"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="toCountry" className="block text-sm font-medium text-black">
              To Country
            </label>
            <select
              id="toCountry"
              value={toCountry}
              onChange={(e) => {
                const selectedCountry = countries.find(
                  (country) => country.code === e.target.value
                );
                setToCountry(e.target.value);
                setToCurrency(selectedCountry?.code || '');
              }}
              className="mt-1 block w-full p-2 border rounded-md text-black"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fromCurrency" className="block text-sm font-medium text-black">
              From Currency
            </label>
            <input
              type="text"
              id="fromCurrency"
              value={fromCurrency}
              className="mt-1 block w-full p-2 border rounded-md text-black"
              disabled
            />
          </div>

          <div>
            <label htmlFor="toCurrency" className="block text-sm font-medium text-black">
              To Currency
            </label>
            <input
              type="text"
              id="toCurrency"
              value={toCurrency}
              className="mt-1 block w-full p-2 border rounded-md text-black"
              disabled
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-black">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="mt-1 block w-full p-2 border rounded-md text-black"
            />
          </div>

          <div>
            <label htmlFor="convertedAmount" className="block text-sm font-medium text-black">
              Converted Amount
            </label>
            <input
              type="number"
              id="convertedAmount"
              value={convertedAmount}
              className="mt-1 block w-full p-2 border rounded-md text-black"
              disabled
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-md text-lg font-semibold"
            >
              Transfer
            </button>
          </div>
        </div>
      </form>

      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Transaction History</h2>
        <ul className="space-y-4">
          {history.map((transaction) => (
            <li key={transaction._id} className="border p-4 rounded-lg text-black">
              <p><strong>From Country:</strong> {transaction.fromCountry}</p>
              <p><strong>To Country:</strong> {transaction.toCountry}</p>
              <p><strong>Amount:</strong> {transaction.amount}</p>
              <p><strong>Converted Amount:</strong> {transaction.convertedAmount}</p>
              <p><strong>Date:</strong> {transaction.date}</p>
              <p><strong>Time:</strong> {transaction.time}</p>
              <button
                onClick={() => deleteTransaction(transaction._id)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
