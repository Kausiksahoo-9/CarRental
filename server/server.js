import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//connect database
await connectDB();

app.get('/',(req,res)=> res.send('server is running'));
app.use('/api/user', userRouter);
app.use('/api/owner',ownerRouter);
app.use('/api/bookings',bookingRouter);

const port = 8000;
app.listen(port,()=>{
  console.log(`app is running on http://localhost:${port}`);
})