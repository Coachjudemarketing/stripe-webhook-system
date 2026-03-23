import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(customerId, courseId, amount) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price_data: { currency: "usd", product_data: { name: `Course: ${courseId}`, description: "Access to course materials and videos" }, unit_amount: amount * 100 }, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });
    return { success: true, sessionId: session.id, url: session.url };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createCustomer(email, name) {
  try {
    const customer = await stripe.customers.create({ email, name });
    return { success: true, customerId: customer.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
