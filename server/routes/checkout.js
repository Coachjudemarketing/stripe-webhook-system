import express from "express";
import { createCheckoutSession, createCustomer } from "../services/checkoutService.js";

const router = express.Router();

router.post("/checkout", async (req, res) => {
  const { email, courseId, amount } = req.body;
  if (!email || !courseId || !amount) return res.status(400).json({ error: "Missing email, courseId, or amount" });
  
  const customerResult = await createCustomer(email, email);
  if (!customerResult.success) return res.status(500).json({ error: customerResult.error });
  
  const checkoutResult = await createCheckoutSession(customerResult.customerId, courseId, amount);
  if (checkoutResult.success) res.json({ success: true, sessionId: checkoutResult.sessionId, url: checkoutResult.url });
  else res.status(500).json({ success: false, error: checkoutResult.error });
});

export default router;
