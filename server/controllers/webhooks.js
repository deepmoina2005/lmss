import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntent.id });
      if (!session.data.length) return;

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) return;

      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId);
      if (!userData || !courseData) return;

      if (!courseData.enrolledStudents.some((id) => id.toString() === userData._id.toString())) {
        courseData.enrolledStudents.push(userData._id);
        await courseData.save();
      }

      if (!userData.enrolledCourses.some((id) => id.toString() === courseData._id.toString())) {
        userData.enrolledCourses.push(courseData._id);
        await userData.save();
      }

      purchaseData.status = "completed";
      await purchaseData.save();
    } catch (error) {
      console.error("Error handling payment success:", error);
    }
  };

  const handlePaymentFailed = async (paymentIntent) => {
    try {
      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntent.id });
      if (!session.data.length) return;

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) return;

      purchaseData.status = "failed";
      await purchaseData.save();
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  };

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
    default:
      break;
  }

  return response.json({ received: true });
};
