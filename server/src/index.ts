import express, {Response, Request} from 'express';
import { configDotenv } from "dotenv";

const app = express();

configDotenv();

const PORT = process.env.PORT || 3000;


app.get("/", (req : Request, res : Response) => {
    res.status(200).json("Healthy server!");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
})


