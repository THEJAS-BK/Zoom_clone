import { useEffect } from "react";

interface MediaPermissionTabProps {
  setIsMediaPermissionGiven: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MediaPermissionTab({
  setIsMediaPermissionGiven,
}: MediaPermissionTabProps) {
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setIsMediaPermissionGiven(true);
      } catch {
        setIsMediaPermissionGiven(false);
      }
    };

    checkPermissions();
  }, [setIsMediaPermissionGiven]);

  return (
    <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3 max-w-sm text-center">
      <p className="text-sm text-gray-600">
        Please give camera and microphone permissions and reload the page.
      </p>
      
    </div>
  );
}