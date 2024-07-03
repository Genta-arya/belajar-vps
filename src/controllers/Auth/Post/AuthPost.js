import prisma from "../../../../Config/Prisma.js";
import { schemaAuth } from "../../../../Schema/Joi.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const HandleRegister = async (req, res) => {
  // Membuat schema validasi dengan Joi

  // Validasi input dari body menggunakan schema
  const { error } = schemaAuth.validate(req.body);
  const { email, password } = req.body; // Mengambil email dan password dari body request

  if (error) {
    // Jika validasi gagal, kembalikan status 400 dengan pesan error
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Mengecek apakah email sudah ada di database
    const existingUser = await prisma.auth.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Jika email sudah ada, kembalikan status 400 dengan pesan error
      return res
        .status(400)
        .json({ message: "Email telah digunakan", status: 400 });
    }

    // Hash password menggunakan bcrypt dengan saltRounds 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat pengguna baru di database
    const newUser = await prisma.auth.create({
      data: {
        email,
        password: hashedPassword, // Menyimpan password yang sudah di-hash
      },
    });

    // Menyiapkan respons pengguna baru
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
    };

    // Kembalikan status 201 (Created) dengan data pengguna dan pesan sukses
    res.status(201).json({
      data: userResponse,
      message: "Created successfully",
      status: 201,
    });
  } catch (err) {
    // Menangani error dan mengembalikan status 500 dengan pesan error
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Secret key for JWT

export const handleLogin = async (req, res) => {
  // Validasi input dari body menggunakan schema
  const { error } = schemaAuth.validate(req.body);
  const { email, password } = req.body;

  if (error) {
    // Jika validasi gagal, kembalikan status 400 dengan pesan error
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Mengecek apakah email ada di database
    const user = await prisma.auth.findUnique({
      where: { email },
    });

    if (!user) {
      // Jika pengguna tidak ditemukan, kembalikan status 401 dengan pesan error
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Memverifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Jika password tidak valid, kembalikan status 401 dengan pesan error
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Cek apakah token sudah ada di database
    let token = user.token;

    if (!token) {
      // Generate JWT token

      token = jwt.sign(
        { id: user.id, email: user.email }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: "3d" } // Options
      );
      // Simpan token di database
      await prisma.auth.update({
        where: { email },
        data: { token }, // Assuming your schema has a token field
      });
    }

    // Kembalikan respons dengan token dan email
    res.status(200).json({
      message: "Login successful",
      data: {
        id: user.id,
        email: user.email, // Mengembalikan email pengguna
        token, // Mengembalikan token JWT
      },
    });
  } catch (err) {
    // Menangani error dan mengembalikan status 500 dengan pesan error
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkLogin = async (req, res) => {
  const { token } = req.body; // Extract the token from the request body

  if (!token) {
    return res.status(400).json({ message: "No token provided." });
  }

  try {
    // Fetch user data based on the decoded token
    const user = await prisma.auth.findFirst({
      where: { token: token },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return user data
    res.status(200).json({
      message: "Succes",
      data: {
        id: user.id,
        email: user.email,
        token: user.token,
      },
    });
  } catch (err) {
    // Handle specific errors
    if (err.name === "JsonWebTokenError") {
      // Handle invalid token errors
      return res.status(401).json({ message: "Invalid token." });
    } else if (err.name === "TokenExpiredError") {
      // Handle expired token errors
      return res.status(401).json({ message: "Token expired." });
    }

    // Handle other errors
    console.error(err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const Logout = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Cari pengguna berdasarkan token
    const user = await prisma.auth.findFirst({
      where: token,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Hapus token dari database
    await prisma.auth.update({
      where: { id: user.id },
      data: { token: null },
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
