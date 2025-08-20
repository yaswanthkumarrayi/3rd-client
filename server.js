// server.js
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: 'rzp_live_R7aFZXp7D1g5yb', // your live key id
  key_secret: 'S8HlKsJ19MM8Rg1VNbpenc84', // your live secret
});

app.post('/api/create-order', async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount, // amount in paise (e.g., 50000 for ₹500)
      currency,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));