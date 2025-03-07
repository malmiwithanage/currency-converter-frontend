'use client';

import { useState, useEffect } from "react";
import { TextField, MenuItem, Button, Typography, Card, CardContent, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
    { name: "Australia", code: "AUD" },
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
          setConvertedAmount(amount * data.rates[toCurrency]); // Recalculate converted amount based on new rate
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency, amount]); // Dependency on fromCurrency, toCurrency, and amount to trigger recalculation

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
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5' }}>
      {/* Currency Conversion Form */}
      <Card variant="outlined" sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
          Transfer Your Money
        </Typography>
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={3} direction="column">
            {/* From Country */}
            <Grid item>
              <TextField
                select
                label="From Country"
                value={fromCountry}
                onChange={(e) => {
                  setFromCountry(e.target.value);
                  setFromCurrency(e.target.value); // Update fromCurrency based on the selected country
                }}
                fullWidth
                variant="outlined"
                color="primary"
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* To Country */}
            <Grid item>
              <TextField
                select
                label="To Country"
                value={toCountry}
                onChange={(e) => {
                  setToCountry(e.target.value);
                  setToCurrency(e.target.value); // Update toCurrency based on the selected country
                }}
                fullWidth
                variant="outlined"
                color="primary"
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Amount */}
            <Grid item>
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                variant="outlined"
                color="primary"
              />
            </Grid>

            {/* From Currency */}
            <Grid item>
              <TextField
                label="From Currency"
                value={fromCurrency}
                disabled
                fullWidth
                variant="outlined"
                color="primary"
              />
            </Grid>

            {/* To Currency */}
            <Grid item>
              <TextField
                label="To Currency"
                value={toCurrency}
                disabled
                fullWidth
                variant="outlined"
                color="primary"
              />
            </Grid>

            {/* Converted Amount */}
            <Grid item>
              <TextField
                label="Converted Amount"
                value={convertedAmount}
                disabled
                fullWidth
                variant="outlined"
                color="primary"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ padding: '12px', fontWeight: 'bold' }}
              >
                Transfer
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Transaction History */}
      <Card variant="outlined" sx={{ maxWidth: 800, margin: '40px auto', padding: 3 }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Transaction History
        </Typography>
        {history.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No transaction history available.
          </Typography>
        ) : (
          history.map((transaction) => (
            <Card key={transaction._id} sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  <strong>From Country:</strong> {transaction.fromCountry}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  <strong>To Country:</strong> {transaction.toCountry}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  <strong>Amount:</strong> {transaction.amount}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  <strong>Converted Amount:</strong> {transaction.convertedAmount}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  <strong>Date:</strong> {transaction.date}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  <strong>Time:</strong> {transaction.time}
                </Typography>
                <Button
                  onClick={() => deleteTransaction(transaction._id)}
                  variant="outlined"
                  color="error"
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </Card>
    </div>
  );
}
