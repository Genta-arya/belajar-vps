import bcrypt from 'bcryptjs'; // Mengimpor pustaka bcryptjs untuk hashing password
import Joi from 'joi'; // Mengimpor pustaka Joi untuk validasi input
import prisma from '../../../Config/Prisma.js'; // Mengimpor instance Prisma untuk interaksi dengan database

// Fungsi untuk menangani pendaftaran pengguna
export const HandleRegister = async (req, res) => {
  // Membuat schema validasi dengan Joi
  const schema = Joi.object({
    email: Joi.string().email().required(), // Email harus dalam format email yang valid dan wajib diisi
    password: Joi.string().required(), // Password harus diisi dan wajib
  });

  // Validasi input dari body menggunakan schema
  const { error } = schema.validate(req.body);
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
      return res.status(400).json({ message: 'Email telah digunakan', status: 400 });
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
    res.status(201).json({ data: userResponse, message: 'Created successfully', status: 201 });
  } catch (err) {
    // Menangani error dan mengembalikan status 500 dengan pesan error
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fungsi untuk mendapatkan data semua pengguna
export const getUser = async (req, res) => {
  try {
    // Mengambil semua pengguna dari database
    const users = await prisma.auth.findMany({
      select: {
        id: true, // Mengambil ID pengguna
        email: true, // Mengambil email pengguna
        token: true, // Mengambil token pengguna (jika ada)
      },
    });

    if (users.length === 0) {
      // Jika tidak ada pengguna, kembalikan status 200 dengan pesan bahwa data kosong
      return res.status(200).json({
        data: users,
        message: 'Data masih kosong',
      });
    }

    // Jika data ada, kembalikan status 200 dengan data pengguna dan pesan sukses
    res.status(200).json({
      data: users,
      message: 'Data berhasil diambil',
    });
  } catch (err) {
    // Menangani error dan mengembalikan status 500 dengan pesan error
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
