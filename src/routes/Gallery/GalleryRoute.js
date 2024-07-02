// src/routes/galleryRoutes.js
import express from "express";
import {
  uploadMultiple,
  uploadSingle,
} from "../../../Midleware/UploadMedia/MidlewareMedia.js";
import { uploadDataGallery } from "../../controllers/gallery/Post/GalleryPost.js";
import {
  editDataGallery,
  editMediaInGallery,
} from "../../controllers/gallery/Edit/GalleryEdit.js";
import {
  deleteDataGallery,
  deleteMediaFromGallery,
} from "../../controllers/gallery/Delete/GalleryDelete.js";
import {
  getDataGallery,
  getGalleryById,
} from "../../controllers/gallery/Get/GalleryData.js";
import { checkTotalSize, handleMulterErrors } from "../../../Config/Multer.js";
import { MidlewareApi } from "../../../Midleware/MidlewareApiAcces.js";

const routerGallery = express.Router();

// Rute untuk mengunggah gambar
routerGallery.post(
  "/post",
  uploadMultiple,
  checkTotalSize,
  MidlewareApi,
  handleMulterErrors,
  uploadDataGallery
);

// edit for post new media
routerGallery.put(
  "/edit/:id",
  uploadMultiple,
  checkTotalSize,
  MidlewareApi,
  handleMulterErrors,
  editDataGallery
);

// edit single media
routerGallery.put(
  "/edit/:galleryId/media/:mediaId",
  uploadSingle,
  checkTotalSize,
  MidlewareApi,
  handleMulterErrors,
  editMediaInGallery
);

// delete single media
routerGallery.delete(
  "/delete/:galleryId/media/:mediaId",
  MidlewareApi,
  deleteMediaFromGallery
);
// delete single gallery
routerGallery.post("/delete/:id",  MidlewareApi, deleteDataGallery);

// get all data gallery
routerGallery.get("/data",   MidlewareApi,getDataGallery);
routerGallery.post("/data/:id",  MidlewareApi, getGalleryById);

export default routerGallery;
