require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10y",
    }
  );
};

const tokenForVerify = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET_FOR_VERIFY,
    { expiresIn: "10y" }
  );
};

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    // Check if authorization header exists and has the correct format
    if (!authorization) {
      return res.status(401).send({
        message: "No authorization header provided",
      });
    }

    // Check if authorization header has Bearer token format
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).send({
        message: "Invalid authorization header format. Expected 'Bearer <token>'",
      });
    }

    const token = authorization.split(" ")[1];

    // Check if token exists after split
    if (!token) {
      return res.status(401).send({
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

// Optional authentication - for routes that work with both logged in and guest users
const optionalAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    // If no authorization header, treat as guest user
    if (!authorization || !authorization.startsWith('Bearer ')) {
      req.user = null; // No user (guest)
      return next();
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      req.user = null; // No user (guest)
      return next();
    }

    // Try to verify token, but don't fail if invalid
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (tokenError) {
      // Token is invalid, treat as guest
      req.user = null;
    }

    next();
  } catch (err) {
    // On any error, treat as guest user
    req.user = null;
    next();
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ role: "Admin" });
    if (admin) {
      next();
    } else {
      res.status(401).send({
        message: "User is not Admin",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error checking admin status: " + err.message,
    });
  }
};

const secretKey = process.env.ENCRYPT_PASSWORD;

// Ensure the secret key is exactly 32 bytes (256 bits)
const key = crypto.createHash("sha256").update(secretKey).digest();

// Helper function to encrypt data
const handleEncryptData = (data) => {
  try {
    // Generate a new IV for each encryption for better security
    const iv = crypto.randomBytes(16); // AES-CBC requires a 16-byte IV

    // Ensure the input is a string or convert it to a string
    const dataToEncrypt = typeof data === "string" ? data : JSON.stringify(data);

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encryptedData = cipher.update(dataToEncrypt, "utf8", "hex");
    encryptedData += cipher.final("hex");

    return {
      data: encryptedData,
      iv: iv.toString("hex"),
    };
  } catch (err) {
    throw new Error("Encryption failed: " + err.message);
  }
};

// Helper function to decrypt data
const handleDecryptData = (encryptedData, ivHex) => {
  try {
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");

    // Try to parse as JSON, return as string if not valid JSON
    try {
      return JSON.parse(decryptedData);
    } catch {
      return decryptedData;
    }
  } catch (err) {
    throw new Error("Decryption failed: " + err.message);
  }
};

module.exports = {
  isAuth,
  optionalAuth, // New middleware for optional authentication
  isAdmin,
  signInToken,
  tokenForVerify,
  handleEncryptData,
  handleDecryptData, // New decrypt function
};