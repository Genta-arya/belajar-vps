import prisma from "../../../../Config/Prisma";
import { idSchema } from "../../../../Schema/Joi";
import path from "path";
import fs from "fs";
export const deleteDataGallery = async (req, res) => {
  const { id } = req.params;

  // Validasi ID
  const { error: idError } = idSchema.validate(parseInt(id));
  if (idError) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    // Cari entri gallery berdasarkan ID
    const galleryItem = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
      include: { media: true }, // Sertakan media terkait
    });

    if (!galleryItem) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    // Hapus media dari gallery dan hapus file media dari server
    if (galleryItem.media.length > 0) {
      for (const media of galleryItem.media) {
        const mediaPath = path.join("uploads", media.filename);

        // Hapus file media dari server
        if (fs.existsSync(mediaPath)) {
          fs.unlinkSync(mediaPath);
        }

        // Hapus entri media dari database
        await prisma.dataMedia.delete({
          where: { id: media.id },
        });
      }
    }

    // Hapus entri gallery dari database
    await prisma.gallery.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: "Gallery item and associated media deleted successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMediaFromGallery = async (req, res) => {
  const { galleryId, mediaId } = req.params;

  // Validasi ID gallery dan media
  const { error: galleryIdError } = idSchema.validate(parseInt(galleryId));
  const { error: mediaIdError } = idSchema.validate(parseInt(mediaId));

  if (galleryIdError || mediaIdError) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    // Cari entri gallery berdasarkan ID
    const galleryItem = await prisma.gallery.findUnique({
      where: { id: parseInt(galleryId) },
      include: { media: true }, // Sertakan media terkait
    });

    if (!galleryItem) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    // Cari entri media berdasarkan ID
    const mediaItem = await prisma.dataMedia.findUnique({
      where: { id: parseInt(mediaId) },
    });

    if (!mediaItem) {
      return res.status(404).json({ error: "Media item not found" });
    }

    // Hapus file media dari server
    const mediaPath = path.join("uploads", mediaItem.filename);
    if (fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath);
    }

    // Hapus entri media dari database
    await prisma.dataMedia.delete({
      where: { id: parseInt(mediaId) },
    });

    // Hapus relasi media dari gallery
    await prisma.gallery.update({
      where: { id: parseInt(galleryId) },
      data: {
        media: {
          disconnect: {
            id: parseInt(mediaId),
          },
        },
      },
    });

    res.status(200).json({
      message: "Media item deleted successfully from gallery!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
