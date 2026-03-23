import { createUserIfNotExists } from "./userService.js";
import { sendEmail } from "./emailService.js";
import { triggerAI } from "./aiService.js";
import { logPayment } from "../db/models/Payment.js";

export async function handlePaymentSuccess(paymentIntent) {
  const email = paymentIntent.receipt_email;
  const user = await createUserIfNotExists(email);
  await logPayment({ userId: user.id, amount: paymentIntent.amount, stripeId: paymentIntent.id, createdAt: Date.now() });
  user.access.push("course_basic");
  await user.save();
  await sendEmail({ to: email, subject: "Access Granted", body: "Your course is now unlocked." });
  await triggerAI({ type: "NEW_CUSTOMER", user });
}
