import fs from "fs";
import {
  idSchema,
  mediaSchema,
  schemaMediPost,
} from "../../../../Schema/Joi.js";
import prisma from "../../../../Config/Prisma.js";
import path from "path";
import bcrypt from "bcryptjs";
export const editDataGallery = async (req, res) => {
  const { id } = req.params;

  // Validasi ID menggunakan schema Joi
  const { error: idError } = idSchema.validate(parseInt(id));
  if (idError) {
    if (req.files) {
      // Hapus file yang telah diupload jika ada
      req.files.forEach((file) =>
        fs.unlinkSync(path.join("uploads", file.filename))
      );
    }
    return res.status(400).json({ error: "Invalid ID" });
  }

  // Validasi input dari body
  const { error: inputError } = schemaMediPost.validate({
    name: req.body.name,
    password: req.body.password, // Validasi password jika ada
  });

  if (inputError) {
    if (req.files) {
      // Hapus file yang telah diupload jika ada
      req.files.forEach((file) =>
        fs.unlinkSync(path.join("uploads", file.filename))
      );
    }
    return res.status(400).json({ error: inputError.details[0].message });
  }

  try {
    // Cari entri gallery berdasarkan ID
    const galleryItem = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
      include: {
        media: true, // Sertakan media terkait
      },
    });

    if (!galleryItem) {
      // Jika item tidak ditemukan, hapus file gambar yang telah diupload jika ada
      if (req.files) {
        req.files.forEach((file) =>
          fs.unlinkSync(path.join("uploads", file.filename))
        );
      }
      return res.status(404).json({ error: "Gallery item not found" });
    }

    // Hash password jika ada
    let hashedPassword = galleryItem.password;
    let isPasswordFlag = galleryItem.isPassword;

    if (req.body.password) {
      const saltRounds = 10; // Jumlah putaran salt untuk bcrypt
      hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      isPasswordFlag = true; // Set isPassword ke true jika ada password
    } else {
      // Jika tidak ada password baru, set isPassword ke false
      isPasswordFlag = false;
    }

    // Update nama gallery dan password jika ada di body
    const updatedGalleryItem = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: {
        name: req.body.name || galleryItem.name, // Pertahankan nama lama jika tidak diubah
        password: hashedPassword, // Update password jika ada
        isPassword: isPasswordFlag, // Set flag isPassword berdasarkan apakah ada password
      },
    });

    // Tambah gambar baru ke DataMedia dan hubungkan ke Gallery jika ada file
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Buat entri baru di DataMedia
        const newMedia = await prisma.dataMedia.create({
          data: {
            filename: file.filename,
            mimetype: file.mimetype,
            path: `uploads/${file.filename}`,
          },
        });

        // Hubungkan gambar baru dengan gallery
        await prisma.gallery.update({
          where: { id: parseInt(id) },
          data: {
            media: {
              connect: { id: newMedia.id },
            },
          },
        });
      }
    }

    res.status(200).json({
      message: "Gallery item updated successfully!",
      data: updatedGalleryItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const editMediaInGallery = async (req, res) => {
  const { galleryId, mediaId } = req.params;

  // Validasi ID gallery dan media menggunakan schema Joi
  const { error: galleryIdError } = idSchema.validate(parseInt(galleryId));
  const { error: mediaIdError } = idSchema.validate(parseInt(mediaId));

  if (galleryIdError || mediaIdError) {
    if (req.file) {
      // Hapus file yang telah diupload jika ada
      fs.unlinkSync(path.join("uploads", req.file.filename));
    }
    return res.status(400).json({ error: "Invalid ID" });
  }

  // Validasi input dari body
  const { error: mediaError } = mediaSchema.validate({
    mediaId: parseInt(mediaId),
  });

  if (mediaError) {
    if (req.file) {
      // Hapus file yang telah diupload jika ada
      fs.unlinkSync(path.join("uploads", req.file.filename));
    }
    return res.status(400).json({ error: mediaError.details[0].message });
  }

  try {
    // Cari entri gallery berdasarkan ID
    const galleryItem = await prisma.gallery.findUnique({
      where: { id: parseInt(galleryId) },
      include: {
        media: true, // Sertakan media terkait
      },
    });

    if (!galleryItem) {
      if (req.file) {
        // Hapus file yang telah diupload jika ada
        fs.unlinkSync(path.join("uploads", req.file.filename));
      }
      return res.status(404).json({ error: "Gallery item not found" });
    }

    // Cari entri media berdasarkan ID
    const mediaItem = await prisma.dataMedia.findUnique({
      where: { id: parseInt(mediaId) },
    });

    if (!mediaItem) {
      if (req.file) {
        // Hapus file yang telah diupload jika ada
        fs.unlinkSync(path.join("uploads", req.file.filename));
      }
      return res.status(404).json({ error: "Media item not found" });
    }

    // Hapus file media lama jika ada
    if (fs.existsSync(path.join("uploads", mediaItem.filename))) {
      fs.unlinkSync(path.join("uploads", mediaItem.filename));
    }

    // Update entri media dengan gambar baru
    const updatedMediaItem = await prisma.dataMedia.update({
      where: { id: parseInt(mediaId) },
      data: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        path: `uploads/${req.file.filename}`,
      },
    });

    // Update gallery untuk menghubungkan media baru jika perlu
    await prisma.gallery.update({
      where: { id: parseInt(galleryId) },
      data: {
        media: {
          connect: { id: updatedMediaItem.id },
        },
      },
    });

    res.status(200).json({
      message: "Media updated successfully!",
      data: updatedMediaItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
