import { upload } from "../../Config/Multer.js";


export const uploadMultiple = upload.array("image", 10);
export const uploadSingle = upload.single("image");
