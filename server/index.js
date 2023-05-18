import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path"; // come's with node
import { fileURLToPath } from "url"; // properly set the paths
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js" 
import { register } from "./controllers/auth.js"
import { verifyToken } from "./middleware/auth.js";

// CONFIGURATIONS, middleware
const __filename = fileURLToPath(import.meta.url); //grab the file url-specifically when use module
const __dirname = path.dirname(__filename);
// invoke
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
// set the dir where we keep assets(locally)
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// FILE STORAGE
const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// ROUTES WITH FILES
app.post("/auth/register", upload.single("picture"), verifyToken , register);

// ROUTES
app.use("/auth", authRoutes); // help's set routes and files organized
app.use("/users", userRoutes);

// MONGOOSE SETUP
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
}).catch((error) => console.log(`${error} did not connect`));