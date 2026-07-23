require("dotenv").config();

const app = require("./src/app");
require("./src/config/db");

// Bổ sung Route Quản lý Admin
const adminRoutes = require("./src/routes/admin.routes");
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});