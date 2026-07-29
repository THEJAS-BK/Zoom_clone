import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import api from "../../utils/axios";
import { useEffect, useState } from "react";
import type { BoardImage } from "./Multicursor/types";
import { useToolSettings } from "../../context/ToolBarLeftContext";
import { socket } from "../../services/socket";
interface ImageDoc {
  _id: string;
  url: string;
  publicId: string;
  uploadedBy: string;
}

export default function ImageUploadInterface({
  images,
  setIsImageUploadInterfaceOpen,
}: {
  images: React.RefObject<BoardImage[]>;
  setIsImageUploadInterfaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [gallaryImages, setGallaryImages] = useState<ImageDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { doRedrawRef, roomId,isOffline } = useToolSettings();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const res = await api.post("/images/upload", formData);
      setGallaryImages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUploadToCanvas = (img: ImageDoc) => {
    const tempImg = new Image();
    tempImg.onload = () => {
      const maxSize = 400;
      let width = tempImg.naturalWidth;
      let height = tempImg.naturalHeight;

      if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width *= scale;
        height *= scale;
      }

      const newImage: BoardImage = {
        type: "image",
        id: crypto.randomUUID(),
        image: img.url,
        x: 100,
        y: 100,
        width,
        height,
        rotation: 0,
        zIndex: 0
      };

      images.current = [...images.current, newImage];
      doRedrawRef.current?.();
      if(!isOffline) {
        socket.emit("element-add", { roomId, element: newImage });
      }
      setIsImageUploadInterfaceOpen(false);
    };
    tempImg.src = img.url;
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get("/images");
        setGallaryImages(res.data);
      } catch (err) {
        console.error("failed to fetch images", err);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#101820]">Upload Image</h2>
        <button
          onClick={() => setIsImageUploadInterfaceOpen(false)}
          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Upload button */}
      <label
        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-full font-medium transition-colors ${
          isUploading
            ? "bg-[#7C6FF0]/60 cursor-not-allowed"
            : "bg-[#7C6FF0] cursor-pointer hover:bg-[#6a5de0]"
        } text-white`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </label>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-zinc-400">or choose from gallery</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {gallaryImages.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-8 text-zinc-300">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs">No images yet</span>
          </div>
        ) : (
          gallaryImages.reverse().map((img) => (
            <button
              key={img._id}
              onClick={() => handleImageUploadToCanvas(img)}
              className="aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-[#7C6FF0] transition-colors"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
