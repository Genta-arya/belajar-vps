import Joi from "joi";

export const schemaMediPost = Joi.object({
  name: Joi.string().required(), // Nama harus diisi
  images: Joi.array().items(Joi.string()).optional(), // Daftar nama file gambar opsional
});
export const idSchema = Joi.number().integer().positive().required();
export const mediaSchema = Joi.object({
  mediaId: Joi.number().integer().positive().required(),
});

export const schemaAuth = Joi.object({
  email: Joi.string().email().required(), // Email harus dalam format email yang valid dan wajib diisi
  password: Joi.string().required(), // Password harus diisi dan wajib
});
