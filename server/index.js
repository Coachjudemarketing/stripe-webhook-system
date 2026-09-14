import express from "express";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";
import { handlePaymentSuccess } from "./services/paymentService.js";
import { isProcessed, markProcessed, logEvent } from "./db/models/EventLog.js";
import videosRouter from "./routes/videos.js";
import checkoutRouter from "./routes/checkout.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook MUST be registered before express.json() so Stripe sees the raw body.
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Signature verification failed:", err.message);
      return res.sendStatus(400);
    }

    await logEvent(event);
    if (await isProcessed(event.id)) return res.sendStatus(200);

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const fullPayment = await stripe.paymentIntents.retrieve(
            event.data.object.id
          );
          await handlePaymentSuccess(fullPayment);
          break;
        }
        case "checkout.session.completed":
          console.log("Checkout session completed:", event.data.object.id);
          break;
        case "customer.subscription.created":
          console.log("Subscription created:", event.data.object.id);
          break;
        default:
          break;
      }
      await markProcessed(event.id);
      return res.sendStatus(200);
    } catch (err) {
      console.error("Processing error:", err);
      return res.sendStatus(500);
    }
  }
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/videos", videosRouter);
app.use("/api/checkout", checkoutRouter);

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/checkout.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Webhook engine running on port ${PORT}`)
);
