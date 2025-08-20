import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));