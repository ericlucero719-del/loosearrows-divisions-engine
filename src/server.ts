import { division1Routes } from './divisions/division1';
import { dispatchRoutes } from './divisions/division3-dispatch';
import express from "express";
import division2Router from "./routes/division2";
import dashboardRouter from "./routes/dashboard";

export const app = express();
const port = process.env.PORT || 3000;
app.use('/division1', division1Routes);
app.use(express.json());
app.use("/division2", division2Router);
app.use("/dashboard", dashboardRouter);
app.use("/dispatch", dispatchRoutes);
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Loose Arrows Divisions Engine" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
