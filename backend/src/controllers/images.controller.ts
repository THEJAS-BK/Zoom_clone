import { Request, RequestHandler, Response } from "express";
import Image from "../models/image.model";

const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file as Express.Multer.File & {
      path: string;
      filename: string;
    };

    const savedImage = await Image.create({
      url: file.path,
      publicId: file.filename,
      uploadedBy: req.userId,
    });

    res.status(201).json(savedImage);
  } catch (err) {
    console.error("Image upload failed:", err);
    res.status(500).json({ message: "Image upload failed" });
  }
};

const fetchImages: RequestHandler = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  await Image.find({ uploadedBy: userId })
    .then((images) => {
      res.status(200).json(images);
    })
    .catch((err) => {
      console.error("Failed to fetch images:", err);
      res.status(500).json({ message: "Failed to fetch images" });
    });
};

const deleteImages: RequestHandler = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const imgId = req.params.id;

  const img = await Image.deleteMany({ _id: imgId, uploadedBy: req.userId });

  res.status(200).json({ message: "deleted successfully" });
};

export { uploadImage, fetchImages, deleteImages };
