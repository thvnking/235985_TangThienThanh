require("dotenv").config();

const connectDatabase = require("./config/database");
const app = require("./app");

const port = process.env.PORT || 5000;

connectDatabase(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend API is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start backend:", error.message);
    process.exitCode = 1;
  });
