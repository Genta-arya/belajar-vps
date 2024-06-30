import prisma from "../../../../Config/Prisma";
import { schemaAuth } from "../../../../Schema/Joi";
import bcrypt from 'bcryptjs'; 
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
    res
      .status(201)
      .json({
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
