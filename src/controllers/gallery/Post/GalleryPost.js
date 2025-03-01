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
    const images = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          mimetype: file.mimetype,
        }))
      : [];

    // Hash password jika diberikan
    let hashedPassword = null;
    let isPassword = false;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      isPassword = true;
    }

    // Menyimpan data media untuk setiap file
    const mediaItems = await Promise.all(
      images.map((image) => {
        console.log(image); // Log data image
        return prisma.dataMedia.create({
          data: {
            filename: image.filename,
            mimetype: image.mimetype,
            path: `uploads/${image.filename}`,
          },
        });
      })
    );

    // Fungsi untuk membuat nama unik
    const generateUniqueName = async (baseName) => {
      let newName = baseName;
      let count = 1;
      while (true) {
        const existingItem = await prisma.gallery.findFirst({
          where: { name: newName },
        });
        if (!existingItem) return newName;
        newName = `${baseName}(${count})`;
        count += 1;
      }
    };

    // Generate nama unik
    const uniqueName = await generateUniqueName(name);

    // Menyimpan entri gallery dengan relasi ke semua media
    const newGalleryItem = await prisma.gallery.create({
      data: {
        name: uniqueName,
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
