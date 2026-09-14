import express from "express";
import { createCheckoutSession, createCustomer } from "../services/checkoutService.js";

const router = express.Router();

// Server-side catalog only. Never take unit_amount from the client.
const COURSE_PRICES_CENTS = {
  course_basic: 2900,
  course_pro: 9900
};

router.post("/checkout", async (req, res) => {
  const { email, courseId } = req.body || {};
  if (!email || !courseId) {
    return res.status(400).json({ error: "Missing email or courseId" });
  }

  const amountCents = COURSE_PRICES_CENTS[courseId];
  if (!amountCents) {
    return res.status(400).json({ error: "Unknown courseId" });
  }

  const customerResult = await createCustomer(email, email);
  if (!customerResult.success) {
    return res.status(500).json({ error: customerResult.error });
  }

  const checkoutResult = await createCheckoutSession(
    customerResult.customerId,
    courseId,
    amountCents
  );
  if (checkoutResult.success) {
    return res.json({
      success: true,
      sessionId: checkoutResult.sessionId,
      url: checkoutResult.url
    });
  }
  return res.status(500).json({ success: false, error: checkoutResult.error });
});

export default router;
