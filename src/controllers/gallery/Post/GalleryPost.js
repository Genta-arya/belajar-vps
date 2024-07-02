import { schemaMediPost } from "../../../../Schema/Joi.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import prisma from "../../../../Config/Prisma.js";

export const uploadDataGallery = async (req, res) => {
  // Validasi input
  const { error } = schemaMediPost.validate({
    name: req.body.name,
    images: req.files ? req.files.map((file) => file.filename) : [],
    password: req.body.password, // Menambahkan password ke validasi
  });

  if (error) {
    // Hapus file yang telah diupload jika validasi gagal
    if (req.files) {
      req.files.forEach((file) =>
        fs.unlinkSync(path.join("uploads", file.filename))
      );
    }
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { name, password } = req.body;
    const images = req.files ? req.files.map((file) => file.filename) : [];

    let hashedPassword = null;
    let isPassword = false;
    if (password) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      isPassword = true; // Set isPassword to true if password is provided
    }

    // Menyimpan data media untuk setiap file
    const mediaItems = await Promise.all(
      images.map((image) =>
        prisma.dataMedia.create({
          data: {
            filename: image,
            mimetype: "image/jpeg",
            path: `uploads/${image}`,
          },
        })
      )
    );

    // Menyimpan entri gallery dengan relasi ke semua media
    const newGalleryItem = await prisma.gallery.create({
      data: {
        name,
        password: hashedPassword, // Menyimpan hashed password jika disediakan
        isPassword, // Menyimpan status isPassword
        media: {
          connect: mediaItems.map((media) => ({ id: media.id })),
        },
      },
    });

    res.status(201).json({
      message: "Images uploaded successfully!",
      data: newGalleryItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
