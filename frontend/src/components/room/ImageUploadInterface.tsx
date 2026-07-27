import { X, Upload, ImageIcon } from "lucide-react";
import api from "../../utils/axios";

export default function ImageUploadInterface({
  setIsImageUploadInterfaceOpen,
}: {
  setIsImageUploadInterfaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {

  const handleFileChange=async (e: React.ChangeEvent<HTMLInputElement>) => {
   const file=e.target.files?.[0];
   if(!file) return;
   const formData=new FormData();
   formData.append("image", file);

    try{
      const res=await api.post("/image/upload", formData,{
        headers:{"Content-Type": "multipart/form-data"}
      });
      console.log(res.data)
      
    }catch(err){
      console.error("upload failed", err)
    }

  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#101820]">Upload Image</h2>
        <button
          onClick={() => {
            console.log("hello")
            setIsImageUploadInterfaceOpen(false)}}
          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Upload button */}
      <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#7C6FF0] text-white font-medium cursor-pointer hover:bg-[#6a5de0] transition-colors">
        <Upload className="w-4 h-4" />
        Upload
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
           handleFileChange(e)

            
          }}
        />
      </label>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-zinc-400">or choose from gallery</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      {/* Image grid — populate from API later */}
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {/* Placeholder empty state until API is wired up */}
        <div className="col-span-3 flex flex-col items-center justify-center py-8 text-zinc-300">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-xs">No images yet</span>
        </div>

        {/* When ready, map images like:
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => handleSelectImage(img)}
            className="aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-[#7C6FF0] transition-colors"
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        */}
      </div>
    </div>
  );
}