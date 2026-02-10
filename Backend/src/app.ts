import express from "express";
import cors from "cors";
import routes from "./routes";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

// 🔍 Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Register routes
app.use("/api", routes);

// Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;