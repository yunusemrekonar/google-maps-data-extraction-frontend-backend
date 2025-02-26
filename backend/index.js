require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key";
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cors());

// --- Nodemailer Ayarları ---
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Helper: Sosyal Medya Linklerini Çıkart ---
const extractSocialLinks = (website) => {
  if (!website || website === "N/A") {
    return { instagram: "N/A", facebook: "N/A", twitter: "N/A" };
  }
  return {
    instagram: website.includes("instagram.com") ? website : "N/A",
    facebook: website.includes("facebook.com") ? website : "N/A",
    twitter: website.includes("twitter.com") ? website : "N/A",
  };
};

// --- Place Details Fonksiyonu ---
// Belirtilen place_id için Place Details API çağrısı yapar ve rating, user_ratings_total bilgilerini de ekler.
const fetchPlaceDetails = async (placeId) => {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total&key=${apiKey}`;
    const response = await axios.get(detailsUrl);
    const data = response.data.result;
    const socialLinks = extractSocialLinks(data.website);
    return {
      name: data.name || "N/A",
      address: data.formatted_address || "N/A",
      phone: data.formatted_phone_number || "N/A",
      email: "N/A", // Google Places API email bilgisini sağlamaz
      website: data.website || "N/A",
      instagram: socialLinks.instagram,
      facebook: socialLinks.facebook,
      twitter: socialLinks.twitter,
      rating: data.rating || 0,
      user_ratings_total: data.user_ratings_total || 0,
    };
  } catch (error) {
    console.error("❌ Error fetching details for place ID:", placeId, error);
    return {
      name: "N/A",
      address: "N/A",
      phone: "N/A",
      email: "N/A",
      website: "N/A",
      instagram: "N/A",
      facebook: "N/A",
      twitter: "N/A",
      rating: 0,
      user_ratings_total: 0,
    };
  }
};

// --- Fetch Places Data Fonksiyonu ---
// İlk olarak Text Search API ile arama yapar, ardından next_page_token ile sayfalama uygular.
// Her sonuç için Place Details API çağrısı yapılarak detaylar getirilir.
const fetchPlacesData = async (query, count) => {
  try {
    let allResults = [];
    let nextPageToken = null;
    let firstCall = true;

    do {
      let url;
      if (firstCall) {
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
        firstCall = false;
      } else {
        // next_page_token'in aktif hale gelmesi için 2-3 saniye bekleyin
        await new Promise((resolve) => setTimeout(resolve, 2500));
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
      }
      console.log("📌 Fetching from URL:", url);
      const response = await axios.get(url);
      const results = response.data.results || [];
      allResults = allResults.concat(results);
      nextPageToken = response.data.next_page_token;
    } while (nextPageToken && allResults.length < count);

    const slicedResults = allResults.slice(0, count);
    const detailedResults = await Promise.all(
      slicedResults.map(async (result) => {
        return await fetchPlaceDetails(result.place_id);
      })
    );
    return detailedResults;
  } catch (error) {
    console.error("❌ Error fetching places data:", error);
    return [];
  }
};

// --- Filtreleme Fonksiyonları ---
// Gelen sonuçları, filterType parametresine göre sıralar veya filtreler.
const filterAndSortResults = (results, filterType) => {
  if (filterType === "most_reviews") {
    return results.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
  } else if (filterType === "highest_rating") {
    return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (filterType === "five_star") {
    return results.filter((result) => result.rating === 5);
  }
  return results;
};

const fetchFilteredPlacesData = async (query, count, filterType) => {
  // Daha fazla sonuç çekip ardından filtre uygula
  const detailedResults = await fetchPlacesData(query, count * 2);
  const filteredResults = filterAndSortResults(detailedResults, filterType);
  return filteredResults.slice(0, count);
};

// --- Kullanıcı Kayıt Endpoint'i ---
app.post("/api/register", async (req, res) => {
  const { username, password, name, surname } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "User already exists!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await pool.query(
      "INSERT INTO users (username, password, name, surname, verificationCode, isVerified) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, name, surname, verificationCode, false]
    );
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: username,
      subject: "Email Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({
      message: "User registered successfully! Please check your email for the verification code.",
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// --- E-posta Doğrulama Endpoint'i ---
app.post("/api/verify-code", async (req, res) => {
  const { username, code } = req.body;
  if (!username || !code) {
    return res.status(400).json({ error: "Username and verification code are required." });
  }
  try {
    const [rows] = await pool.query("SELECT verificationCode FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(400).json({ error: "User not found." });
    }
    if (rows[0].verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code." });
    }
    await pool.query("UPDATE users SET isVerified = ?, verificationCode = NULL WHERE username = ?", [true, username]);
    res.json({ message: "✅ Email verified successfully! You can now log in." });
  } catch (error) {
    console.error("❌ Error verifying code:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// --- Login Endpoint'i (E-posta Doğrulaması Dahil) ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials (User not found)" });
    }
    const user = rows[0];
    console.log("✅ User found:", user);
    console.log("Type of isVerified:", typeof user.isVerified, user.isVerified);
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials (Wrong password)" });
    }
    if (Number(user.isVerified) !== 1) {
      console.log("⛔ User is NOT verified! Value:", user.isVerified);
      return res.status(401).json({ error: "❌ Please verify your email before logging in." });
    }
    console.log("✅ User is verified, logging in...");
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, message: "✅ Login successful!" });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Access denied!" });
  jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// --- Scrape Endpoint ---
app.post("/api/scrape", authenticateToken, async (req, res) => {
  try {
    const { link, count, filter } = req.body;
    if (!link || !count || count < 1 || count > 200) {
      return res.status(400).json({ error: "Invalid input" });
    }
    console.log(`🔍 Fetching Google Places data for: ${link} with count: ${count} and filter: ${filter}`);
    const businesses =
      filter && filter !== "default"
        ? await fetchFilteredPlacesData(link, count, filter)
        : await fetchPlacesData(link, count);
    res.status(200).json({ success: true, businesses });
  } catch (error) {
    console.error("❌ Scraping failed:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
