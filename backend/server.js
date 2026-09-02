// ============================================================
// VESTIQ BACKEND SERVER
// Node.js + Express
// ============================================================

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// PATHS
// ------------------------------------------------------------

const ROOT = path.join(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DATA_DIR = path.join(__dirname, "data");
const WARDROBE_FILE = path.join(DATA_DIR, "wardrobe.json");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(WARDROBE_FILE)) {
    fs.writeFileSync(WARDROBE_FILE, "[]", "utf8");
}

// ------------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend
app.use(express.static(FRONTEND_DIR));

// Uploaded clothing images
app.use("/uploads", express.static(UPLOAD_DIR));

// ------------------------------------------------------------
// MULTER UPLOAD CONFIGURATION
// ------------------------------------------------------------

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();

        const safeName =
            Date.now() +
            "-" +
            Math.random().toString(36).substring(2, 10) +
            extension;

        cb(null, safeName);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 8 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."));
        }

        cb(null, true);
    }
});

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function readWardrobe() {

    try {

        const data = fs.readFileSync(
            WARDROBE_FILE,
            "utf8"
        );

        if (!data.trim()) {
            return [];
        }

        return JSON.parse(data);

    } catch (error) {

        console.error("Could not read wardrobe:", error);

        return [];
    }
}

function saveWardrobe(items) {

    fs.writeFileSync(
        WARDROBE_FILE,
        JSON.stringify(items, null, 2),
        "utf8"
    );
}

// ------------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------------

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "VESTIQ backend is running",
        time: new Date().toISOString()
    });

});

// ------------------------------------------------------------
// GET WARDROBE
// ------------------------------------------------------------

app.get("/api/wardrobe", (req, res) => {

    const wardrobe = readWardrobe();

    res.json({
        success: true,
        items: wardrobe
    });

});

// ------------------------------------------------------------
// ADD WARDROBE ITEM
// ------------------------------------------------------------

app.post(
    "/api/wardrobe",
    upload.single("image"),
    (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Please select a clothing image."
                });

            }

            const wardrobe = readWardrobe();

            const item = {

                id:
                    Date.now().toString() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .substring(2, 8),

                userId: req.body.userId || "guest",

                name:
                    req.body.name ||
                    req.file.originalname ||
                    "Untitled clothing",

                category:
                    req.body.category ||
                    "Other",

                color:
                    req.body.color ||
                    "",

                details:
                    req.body.details ||
                    "",

                image:
                    "/uploads/" +
                    req.file.filename,

                filename:
                    req.file.filename,

                originalName:
                    req.file.originalname,

                dateAdded:
                    new Date().toISOString()
            };

            wardrobe.unshift(item);

            saveWardrobe(wardrobe);

            console.log("WARDROBE ITEM ADDED:");
            console.log(item);

            res.status(201).json({
                success: true,
                message: "Clothing added successfully.",
                item
            });

        } catch (error) {

            console.error("Upload error:", error);

            res.status(500).json({
                success: false,
                message: "Could not save clothing item."
            });
        }

    }
);

// ------------------------------------------------------------
// DELETE WARDROBE ITEM
// ------------------------------------------------------------

app.delete("/api/wardrobe/:id", (req, res) => {

    try {

        const wardrobe = readWardrobe();

        const item = wardrobe.find(
            x => x.id === req.params.id
        );

        if (!item) {

            return res.status(404).json({
                success: false,
                message: "Clothing item not found."
            });

        }

        const updated = wardrobe.filter(
            x => x.id !== req.params.id
        );

        saveWardrobe(updated);

        // Delete image from uploads folder
        if (item.filename) {

            const imagePath = path.join(
                UPLOAD_DIR,
                item.filename
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({
            success: true,
            message: "Clothing deleted successfully."
        });

    } catch (error) {

        console.error("Delete error:", error);

        res.status(500).json({
            success: false,
            message: "Could not delete item."
        });
    }

});

// ------------------------------------------------------------
// PROFILE
// ------------------------------------------------------------

app.get("/api/profile", (req, res) => {

    res.json({
        success: true,

        profile: {
            name: "VESTIQ User",
            email: "guest@vestiq.local"
        }

    });

});

// ------------------------------------------------------------
// STYLE MATCHER
// ------------------------------------------------------------

app.post("/api/style-match", (req, res) => {

    const wardrobe = readWardrobe();

    if (wardrobe.length === 0) {

        return res.json({
            success: true,
            message: "Add some clothing first.",
            outfit: []
        });

    }

    const tops = wardrobe.filter(item =>
        [
            "Shirt",
            "T-shirt",
            "Crop top",
            "Jacket"
        ].includes(item.category)
    );

    const bottoms = wardrobe.filter(item =>
        [
            "Pants",
            "Jeans",
            "Skirt"
        ].includes(item.category)
    );

    const dresses = wardrobe.filter(item =>
        item.category === "Dress"
    );

    const shoes = wardrobe.filter(item =>
        item.category === "Shoes"
    );

    const outfit = [];

    if (tops.length) {
        outfit.push(tops[0]);
    }

    if (bottoms.length) {
        outfit.push(bottoms[0]);
    } else if (dresses.length) {
        outfit.push(dresses[0]);
    }

    if (shoes.length) {
        outfit.push(shoes[0]);
    }

    if (outfit.length === 0) {
        outfit.push(wardrobe[0]);
    }

    res.json({
        success: true,
        title: "VESTIQ Style Match",
        description:
            "A complete look selected from your wardrobe.",
        outfit
    });

});

// ------------------------------------------------------------
// AI WEEKLY PLANNER
// ------------------------------------------------------------

app.post("/api/planner", (req, res) => {

    const wardrobe = readWardrobe();

    if (wardrobe.length === 0) {

        return res.json({
            success: true,
            message:
                "Add clothing to your wardrobe before building your week.",
            days: []
        });

    }

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    const tops = wardrobe.filter(item =>
        [
            "Shirt",
            "T-shirt",
            "Crop top",
            "Jacket"
        ].includes(item.category)
    );

    const bottoms = wardrobe.filter(item =>
        [
            "Pants",
            "Jeans",
            "Skirt"
        ].includes(item.category)
    );

    const dresses = wardrobe.filter(item =>
        item.category === "Dress"
    );

    const shoes = wardrobe.filter(item =>
        item.category === "Shoes"
    );

    const result = days.map((day, index) => {

        let outfit = [];

        if (dresses.length && index === 5) {

            outfit.push(
                dresses[index % dresses.length]
            );

        } else {

            if (tops.length) {

                outfit.push(
                    tops[index % tops.length]
                );

            }

            if (bottoms.length) {

                outfit.push(
                    bottoms[index % bottoms.length]
                );

            } else if (dresses.length) {

                outfit.push(
                    dresses[index % dresses.length]
                );

            }
        }

        if (shoes.length) {

            outfit.push(
                shoes[index % shoes.length]
            );

        }

        if (outfit.length === 0) {

            outfit.push(
                wardrobe[index % wardrobe.length]
            );
        }

        return {
            day,
            outfit
        };

    });

    res.json({
        success: true,
        days: result
    });

});

// ------------------------------------------------------------
// FRONTEND FALLBACK
// IMPORTANT: Express 5 DOES NOT USE app.get("*")
// ------------------------------------------------------------

app.use((req, res, next) => {

    if (
        req.method === "GET" &&
        !req.path.startsWith("/api/") &&
        !req.path.startsWith("/uploads/")
    ) {

        return res.sendFile(
            path.join(FRONTEND_DIR, "index.html")
        );

    }

    next();

});

// ------------------------------------------------------------
// ERROR HANDLER
// ------------------------------------------------------------

app.use((error, req, res, next) => {

    console.error(error);

    res.status(500).json({
        success: false,
        message:
            error.message ||
            "Server error."
    });

});

// ------------------------------------------------------------
// START
// ------------------------------------------------------------

app.listen(PORT, () => {

    console.log("");
    console.log("====================================");
    console.log("       VESTIQ FASHION TECH");
    console.log("====================================");
    console.log("");
    console.log(
        `VESTIQ running at http://localhost:${PORT}`
    );
    console.log("");
    console.log(
        `Uploads: ${UPLOAD_DIR}`
    );
    console.log(
        `Wardrobe: ${WARDROBE_FILE}`
    );
    console.log("");

});