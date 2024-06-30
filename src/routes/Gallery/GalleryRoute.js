// src/routes/galleryRoutes.js
import express from 'express';
import { getDataGallery, uploadDataGallery, uploadSingle } from '../../controllers/gallery/GalleryController';


const routerGallery = express.Router();

// Rute untuk mengunggah gambar
routerGallery.post('/upload', uploadSingle, uploadDataGallery);
routerGallery.get('/data', getDataGallery);

export default routerGallery;
