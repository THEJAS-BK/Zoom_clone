import { X, ImageIcon, Loader2, Trash2, Check } from "lucide-react";
import api from "../../utils/axios";
import { useEffect, useState } from "react";

interface ImageDoc {
  _id: string;
  url: string;
  publicId: string;
  uploadedBy: string;
}

export default function MyImages({
  setMyImageInterfaceOpen,
}: {
  setMyImageInterfaceOpen: (open: boolean) => void;
}) {
  const [images, setImages] = useState<ImageDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get("/images");
        setImages(res.data);
      } catch (err) {
        console.error("failed to fetch images", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => api.delete(`/images/${id}`))
      );
      setImages((prev) => prev.filter((img) => !selectedIds.has(img._id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("failed to delete images", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#101820]">My Images</h2>
        <button
          onClick={() => setMyImageInterfaceOpen(false)}
          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Image grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-300">
          <Loader2 className="w-6 h-6 mb-2 animate-spin" />
          <span className="text-xs">Loading images...</span>
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-300">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-xs">No images yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {images.map((img) => {
            const isSelected = selectedIds.has(img._id);
            return (
              <div
                key={img._id}
                className={`relative aspect-square rounded-lg overflow-hidden border transition-colors ${
                  isSelected ? "border-[#7C6FF0]" : "border-zinc-200"
                }`}
              >
                <button
                  onClick={() => toggleSelect(img._id)}
                  className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md border border-white/70 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  {isSelected && (
                    <div className="w-full h-full rounded-md bg-[#7C6FF0] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => toggleSelect(img._id)}
                  className="w-full h-full"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete button */}
      {images.length > 0 && (
        <button
          onClick={handleDeleteSelected}
          disabled={selectedIds.size === 0 || isDeleting}
          className={`flex items-center justify-center gap-2 w-full mt-6 py-2.5 rounded-full font-medium transition-colors ${
            selectedIds.size === 0 || isDeleting
              ? "bg-red-400/50 cursor-not-allowed"
              : "bg-red-500 cursor-pointer hover:bg-red-600"
          } text-white`}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Delete image{selectedIds.size > 1 ? "s" : ""}
              {selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
            </>
          )}
        </button>
      )}
    </div>
  );
}