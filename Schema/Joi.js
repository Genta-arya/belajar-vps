import Joi from "joi";

export const schemaMediPost = Joi.object({
  name: Joi.string().required(), // Nama harus diisi
  images: Joi.array().items(Joi.string()).optional(), // Daftar nama file gambar opsional
});
export const idSchema = Joi.number().integer().positive().required();
export const mediaSchema = Joi.object({
  mediaId: Joi.number().integer().positive().required(),
});
