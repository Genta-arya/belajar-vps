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
import { getDataGallery } from "../../controllers/gallery/Get/GalleryData.js";

const routerGallery = express.Router();

// Rute untuk mengunggah gambar
routerGallery.post("/post", uploadMultiple, uploadDataGallery);

// edit for post new media
routerGallery.put("/edit/:id", uploadMultiple, editDataGallery);

// edit single media
routerGallery.put(
  "/edit/:galleryId/media/:mediaId",
  uploadSingle,
  editMediaInGallery
);

// delete single media
routerGallery.delete(
  "/delete/:galleryId/media/:mediaId",
  deleteMediaFromGallery
);
// delete single gallery
routerGallery.delete("/delete/:id", deleteDataGallery);

// get all data gallery
routerGallery.get("/data", getDataGallery);

export default routerGallery;
