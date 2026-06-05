require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Pool } = require("pg");

const app = express();

// Middleware 
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


pool.connect()
    .then(() => console.log("✅ PostgreSQL cluster pipeline connected"))
    .catch(err => console.error("❌ DB connection error:", err));

app.get("/", (req, res) => {
    res.sendFile("index.html",{root:"public"});
});

// POST Route to Save Carrier Info
app.post("/api/carriers", async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            trailerType,
            maxWeight,
            trailerLength,
            currentCity,
            currentState,
            destinationCity,
            destinationState,
            weeklyTarget,
            availableDate,
            timeWindow
        } = req.body;

        if (!fullName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and phone are core required entries."
            });
        }

        const query = `
            INSERT INTO carriers (
                full_name, email, phone, trailer_type, max_weight, trailer_length,
                current_city, current_state, destination_city, destination_state,
                weekly_target, available_date, time_window
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
        `;

        const values = [
            fullName, email, phone, trailerType, maxWeight, trailerLength,
            currentCity, currentState, destinationCity, destinationState,
            weeklyTarget, availableDate ? availableDate : null, timeWindow
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Carrier records filed successfully",
            carrier: result.rows[0]
        });

    } catch (error) {
        console.error("POST /api/carriers system error:", error);
        res.status(500).json({ success: false, message: "Internal server payload error" });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Node operational environment spinning on port ${PORT}`));