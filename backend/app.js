const express = require("express");
const Stripe = require("stripe");
const paypal = require("@paypal/checkout-server-sdk");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const axios = require("axios");
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
  })
);
// Middleware
app.use(bodyParser.json());

// PayPal environment setup
const paypalEnvironment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// Stripe API endpoint to create a PaymentIntent
app.post("/stripe/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount is in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal API endpoint to create an order
app.post("/paypal/create-order", async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount,
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal API endpoint to capture payment for an order
app.post("/paypal/capture-order", async (req, res) => {
  const { orderId } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    res.json({ status: "success", details: capture.result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/stripe/create-connected-account", async (req, res) => {
  const { email } = req.body;
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email: email,
    });
    res.json({ accountId: account.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
app.post("/stripe/create-onboarding-link", async (req, res) => {
  const { accountId } = req.body;

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "http://localhost:5173/reauth", // URL to redirect the provider if onboarding fails
      return_url: "http://localhost:5173/onboarding-complete", // URL to redirect after successful onboarding
      type: "account_onboarding",
    });
    res.json({ url: accountLink.url });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
app.post("/stripe/get-account-status", async (req, res) => {
  const { accountId } = req.body;

  try {
    // Retrieve account information from Stripe
    const account = await stripe.accounts.retrieve(accountId);
    res.json({
      status: account.details_submitted ? "Completed" : "Incomplete",
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
app.post("/stripe/create-payout", async (req, res) => {
  const { accountId, amount } = req.body;
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    const availableBalance = balance.available[0].amount;

    if (availableBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const payout = await stripe.payouts.create(
      {
        amount: amount,
        currency: "usd",
      },
      {
        stripeAccount: accountId,
      }
    );

    res.json({ success: true, payout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 
app.get("/place-details", async (req, res) => {
  const placeId = req.query.placeId;
  
  if (!placeId) {
    return res.status(400).json({ error: "Place ID is required" });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          key: process.env.GOOGLE_API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      return res.status(500).json({
        error: "Failed to fetch place details",
        details: response.data,
      });
    }

    res.json(response.data.result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching place details", details: error.message });
  }
});
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on port ${PORT}`);
});
