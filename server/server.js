import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import connectDB from "./configs/mongodb.js";
import { stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();

await connectDB();

app.use(cors());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.send("VidyaHub API is running");
});

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

