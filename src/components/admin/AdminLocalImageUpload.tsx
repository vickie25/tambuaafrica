import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { compressImage, uploadFileToSupabase } from "@/lib/image-utils";
import { toast } from "sonner";

type UploadMode = "original" | "optimized";

type AdminLocalImageUploadProps = {
  /** Single image replaces value; multiple calls onBatchUploaded only */
  multiple?: boolean;
  disabled?: boolean;
  buttonLabel?: string;
  uploadMode?: UploadMode;
  onUploadModeChange?: (mode: UploadMode) => void;
  onSingleUploaded?: (url: string) => void;
  onBatchUploaded?: (urls: string[]) => void;
};

export const AdminLocalImageUpload = ({
  multiple = false,
  disabled = false,
  buttonLabel,
  uploadMode: controlledMode,
  onUploadModeChange,
  onSingleUploaded,
  onBatchUploaded,
}: AdminLocalImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalMode, setInternalMode] = useState<UploadMode>("original");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; fileName: string } | null>(
    null,
  );

  const uploadMode = controlledMode ?? internalMode;
  const setUploadMode = (mode: UploadMode) => {
    if (onUploadModeChange) onUploadModeChange(mode);
    else setInternalMode(mode);
  };

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setUploading(true);
    setProgress({ current: 0, total: files.length, fileName: files[0].name });

    try {
      const urls: string[] = [];
      for (const [index, file] of files.entries()) {
        setProgress({ current: index + 1, total: files.length, fileName: file.name });
        const prepared = uploadMode === "optimized" ? await compressImage(file) : file;
        urls.push(await uploadFileToSupabase(prepared));
      }

      if (multiple) {
        onBatchUploaded?.(urls);
        toast.success(`${urls.length} image(s) uploaded`);
      } else {
        onSingleUploaded?.(urls[0]);
        toast.success("Image uploaded");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-accent/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {buttonLabel ?? (multiple ? "Upload images from your computer" : "Upload image from your computer")}
        </p>
        <Select
          value={uploadMode}
          onValueChange={(v) => setUploadMode(v as UploadMode)}
          disabled={disabled || uploading}
        >
          <SelectTrigger className="h-8 w-[180px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Original quality</SelectItem>
            <SelectItem value="optimized">Compress first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="secondary"
        className="w-full sm:w-auto"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {uploading ? "Uploading…" : multiple ? "Choose images" : "Choose image"}
      </Button>

      {progress && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-accent" />
          Uploading {progress.current} of {progress.total}: {progress.fileName}
        </p>
      )}
    </div>
  );
};
