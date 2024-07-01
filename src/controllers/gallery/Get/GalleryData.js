import prisma from "../../../../Config/Prisma.js";

export const getDataGallery = async (req, res) => {
  try {
    // Mengambil data gallery dengan data media yang terkait
    const dataGallery = await prisma.gallery.findMany({
      include: {
        media: true, // Menyertakan data media terkait
      },
    });

    const baseUrl = `http://${req.headers.host}/uploads/`;

    // Memformat data dengan URL gambar dan detail media
    const dataWithUrls = dataGallery.map((item) => ({
      ...item,
      media: item.media.map((mediaItem) => ({
        id: mediaItem.id,
        filename: mediaItem.filename,
        mimetype: mediaItem.mimetype,
        url: `${baseUrl}${mediaItem.filename}`, // Menyertakan URL gambar
      })),
    }));

    res.status(200).json({
      message: "Data Gallery",
      data: dataWithUrls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
