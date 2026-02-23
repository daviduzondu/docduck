import express from "express";
import 'dotenv/config';

const app = express();
const port = process.env.PORT ?? "9001";


app.listen(port, () => {
  console.log(`Server now listening on ${port}`);
});