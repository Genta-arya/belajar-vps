import prisma from "../../../../Config/Prisma.js";
import bcrypt from "bcryptjs";

export const getDataGallery = async (req, res) => {
  try {
    // Mengambil data gallery dengan data media yang terkait
    const dataGallery = await prisma.gallery.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        isPassword: true,
      },
    });

    const baseUrl = `http://${req.headers.host}/uploads/`;

    // Memformat data dengan URL gambar dan detail media

    res.status(200).json({
      message: "Data Gallery",
      data: dataGallery,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getGalleryById = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil ID dari parameter URL
    const { password } = req.body; // Mengambil password dari body permintaan

    // Mengambil data gallery dengan ID dan media yang terkait
    const dataGallery = await prisma.gallery.findUnique({
      where: { id: parseInt(id, 10) }, // Menyaring berdasarkan ID
      include: {
        media: true, // Menyertakan data media terkait
      },
    });

    // Jika tidak ada data dengan ID tersebut
    if (!dataGallery) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    // Jika password di database tidak null, maka password dari body harus ada
    if (dataGallery.password) {
      if (!password) {
        return res.status(401).json({ error: "Password is required" });
      }

      // Memverifikasi password
      const isMatch = await bcrypt.compare(password, dataGallery.password);
      if (!isMatch) {
        return res.status(403).json({ error: "Invalid password" });
      }
    }

    const baseUrl = `https://${req.headers.host}/uploads/`;

    // Memformat data dengan URL gambar dan detail media
    const dataWithUrls = {
      ...dataGallery,
      media: dataGallery.media.map((mediaItem) => ({
        id: mediaItem.id,
        filename: mediaItem.filename,
        mimetype: mediaItem.mimetype,
        url: `${baseUrl}${mediaItem.filename}`, // Menyertakan URL gambar
      })),
    };

    res.status(200).json({
      message: "Data Gallery",
      data: dataWithUrls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
