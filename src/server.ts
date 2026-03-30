import express from "express";
import path from "path";
import { division1Routes } from './divisions/division1';
import { dispatchRoutes } from './divisions/division3-dispatch';
import division2Router from "./routes/division2";
import dashboardRouter from "./routes/dashboard";
import division1UploadRouter from "./routes/division1Upload";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rapidResponseDispatchRoute = require("./routes/rapidResponseDispatchRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rapidResponseTaskRoute = require("./routes/rapidResponseTaskRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rapidResponseEventRoute = require("./routes/rapidResponseEventRoute");

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/division1', division1UploadRouter);
app.use('/division1', division1Routes);
app.use("/division2", division2Router);
app.use("/dashboard", dashboardRouter);
app.use("/dispatch", dispatchRoutes);
app.use("/rapid-response", rapidResponseDispatchRoute);
app.use("/field/rapid-response", rapidResponseDispatchRoute);
app.use("/field/rapid-response/tasks", rapidResponseTaskRoute);
app.use("/field/rapid-response", rapidResponseEventRoute);

app.get("/api", (_req, res) => {
  res.json({ message: "Welcome to Loose Arrows Divisions Engine" });
});

if (require.main === module) {
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}
