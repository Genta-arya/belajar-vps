import Joi from "joi";
import upload from "../../../Config/Multer.js";
import prisma from "../../../Config/Prisma.js";

export const uploadSingle = upload.single("image");
export const uploadDataGallery = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    image: Joi.string().required(), 
  });


  const { error } = schema.validate({
    name: req.body.name,
    image: req.file ? req.file.filename : "",
  });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { name } = req.body;
    const image = req.file ? req.file.filename : "";

    // Simpan data ke database menggunakan Prisma
    const newGalleryItem = await prisma.gallery.create({
      data: {
        name,
        image,
      },
    });

    res.status(201).json({
      message: "Image uploaded successfully!",
      data: newGalleryItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getDataGallery = async (req, res) => {
    try {
      const dataGallery = await prisma.gallery.findMany();
  
     
      const baseUrl = `http://${req.headers.host}/uploads/`;
  
    
      const dataWithUrls = dataGallery.map(item => ({
        ...item,
        imageUrl: `${baseUrl}${item.image}`
      }));
  
      res.status(200).json({
        message: 'Data Gallery',
        data: dataWithUrls,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };