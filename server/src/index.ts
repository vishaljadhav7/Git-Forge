import express, {Response, Request} from 'express';
import { configDotenv } from "dotenv";
import { authRouter } from './routes/auth.route';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

configDotenv();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req : Request, res : Response) => {
    res.status(200).json("Healthy server!");
});

app.use("/api/auth", authRouter);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
})


