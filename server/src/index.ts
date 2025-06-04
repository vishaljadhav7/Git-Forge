import express, { Response, Request } from "express";
import { configDotenv } from "dotenv";
import { authRouter } from "./routes/auth.route";
import { projectRouter } from "./routes/project.route";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import cors from "cors";
import cookieParser from "cookie-parser";
import { commitRouter } from "./routes/commit.route";
import { repoRouter } from "./routes/repo.route";
import rateLimit from "express-rate-limit";

const app = express();

configDotenv();

const PORT = process.env.PORT || 4000;

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 720 * 60 * 1000, 
  max: 80, 
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "12 hrs"
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req, res) => {
    logger.error(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "12 hrs"
    });
  }
});


const authLimiter = rateLimit({
  windowMs: 720 * 60 * 1000, 
  max: 10, 
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes"
  },
  skipSuccessfulRequests: true, 
  handler: (req, res) => {
    logger.error(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many authentication attempts, please try again later.",
      retryAfter: "15 minutes"
    });
  }
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "PATCH", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Healthy server!");
});


app.use("/api/auth", authLimiter, authRouter);
app.use("/api/repo", repoRouter);
app.use("/api", projectRouter);
app.use("/api", commitRouter);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});