import prisma from "../../../../Config/Prisma.js";

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
