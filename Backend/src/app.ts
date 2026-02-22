import express from "express";
import cors from "cors";
import routes from "./routes";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors({
  origin: 'https://front-dep.onrender.com',
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 🔍 Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// ✅ Register all routes only once
app.use("/api", routes);

// Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;