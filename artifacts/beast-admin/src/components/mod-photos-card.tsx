import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Upload, X, Loader2, CheckCircle2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  token: string;
  modPhotos: Record<string, string[]>;
  setModPhotos: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  ALL_IPHONE_MODELS: string[];
}

async function uploadFile(file: File, token: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

async function savePhotos(
  allPhotos: Record<string, string[]>,
  token: string,
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ key: "modificacion_photos", value: JSON.stringify(allPhotos) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function ModPhotosCard({ token, modPhotos, setModPhotos, ALL_IPHONE_MODELS }: Props) {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(ALL_IPHONE_MODELS[0]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [saving, setSaving] = useState(false);

  const currentPhotos: string[] = modPhotos[selectedModel] ?? Array(11).fill("");
  const filledCount = currentPhotos.filter(Boolean).length;
  const totalWithPhotos = Object.values(modPhotos).filter(arr => arr.some(Boolean)).length;

  const persistPhotos = useCallback(async (newAllPhotos: Record<string, string[]>) => {
    setSaving(true);
    const ok = await savePhotos(newAllPhotos, token);
    setSaving(false);
    if (!ok) {
      toast({ title: "Error al guardar", description: "No se pudieron guardar las fotos. Intenta de nuevo.", variant: "destructive" });
    }
    return ok;
  }, [token, toast]);

  const openFilePicker = (multiple: boolean, onFiles: (files: File[]) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = multiple;
    input.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(input);
    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      document.body.removeChild(input);
      if (files.length) onFiles(files);
    };
    input.addEventListener("cancel", () => {
      try { document.body.removeChild(input); } catch {}
    });
    input.click();
  };

  const handleBulkUpload = () => {
    openFilePicker(true, async (files) => {
      const limited = files.slice(0, 11);
      setUploading(true);
      setProgress({ done: 0, total: limited.length });

      const current = [...(modPhotos[selectedModel] ?? Array(11).fill(""))];
      let uploaded = 0;

      for (let i = 0; i < limited.length; i++) {
        const url = await uploadFile(limited[i], token);
        if (url) { current[i] = url; uploaded++; }
        setProgress({ done: i + 1, total: limited.length });
      }

      setUploading(false);

      if (uploaded === 0) {
        toast({ title: "Sin fotos subidas", description: "Ninguna foto pudo cargarse. Intenta de nuevo.", variant: "destructive" });
        return;
      }

      const newAllPhotos = { ...modPhotos, [selectedModel]: current };
      setModPhotos(newAllPhotos);

      const ok = await persistPhotos(newAllPhotos);
      if (ok) {
        toast({
          title: `✅ ${uploaded} foto${uploaded !== 1 ? "s" : ""} guardada${uploaded !== 1 ? "s" : ""}`,
          description: `${selectedModel} — guardado automáticamente.`,
        });
      }
    });
  };

  const handleSlotUpload = (slotIndex: number) => {
    openFilePicker(false, async ([file]) => {
      const url = await uploadFile(file, token);
      if (!url) {
        toast({ title: "Error al subir", description: "No se pudo subir la foto.", variant: "destructive" });
        return;
      }
      const current = [...(modPhotos[selectedModel] ?? Array(11).fill(""))];
      current[slotIndex] = url;
      const newAllPhotos = { ...modPhotos, [selectedModel]: current };
      setModPhotos(newAllPhotos);
      const ok = await persistPhotos(newAllPhotos);
      if (ok) toast({ title: `Foto ${slotIndex + 1} guardada ✅`, description: selectedModel });
    });
  };

  const handleSlotDelete = async (slotIndex: number) => {
    const current = [...(modPhotos[selectedModel] ?? Array(11).fill(""))];
    current[slotIndex] = "";
    const newAllPhotos = { ...modPhotos, [selectedModel]: current };
    setModPhotos(newAllPhotos);
    const ok = await persistPhotos(newAllPhotos);
    if (ok) toast({ title: "Foto eliminada", description: `Slot ${slotIndex + 1} de ${selectedModel} limpiado.` });
  };

  const handleManualSave = async () => {
    const ok = await persistPhotos(modPhotos);
    if (ok) toast({ title: "Guardado ✅", description: "Todas las fotos guardadas correctamente." });
  };

  return (
    <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
      <CardHeader>
        <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
          <Smartphone className="w-5 h-5 text-primary" />
          Fotos Modificación Interna
          {saving && <Loader2 className="w-4 h-4 text-primary animate-spin ml-auto" />}
          {!saving && totalWithPhotos > 0 && (
            <span className="ml-auto text-[10px] font-mono text-green-400 font-normal normal-case tracking-normal">
              {totalWithPhotos} modelo{totalWithPhotos !== 1 ? "s" : ""} con fotos
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-zinc-500 font-mono">
          Las fotos se guardan <span className="text-primary font-bold">automáticamente</span> al subirlas. No necesitas hacer nada extra.
        </p>

        {/* Selector de modelo */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Modelo de iPhone</label>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="w-full bg-black/60 border border-primary/30 text-white rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
          >
            {ALL_IPHONE_MODELS.map(m => {
              const count = (modPhotos[m] ?? []).filter(Boolean).length;
              return (
                <option key={m} value={m} className="bg-zinc-900">
                  {m}{count > 0 ? ` (${count}/11)` : ""}
                </option>
              );
            })}
          </select>
          {filledCount > 0 && (
            <p className="text-[10px] font-mono text-primary">
              {filledCount}/11 foto{filledCount !== 1 ? "s" : ""} cargada{filledCount !== 1 ? "s" : ""} para {selectedModel}
            </p>
          )}
        </div>

        {/* Botón de subida masiva */}
        <button
          type="button"
          disabled={uploading}
          onClick={handleBulkUpload}
          className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70 font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Subiendo foto {progress.done} de {progress.total}...</span>
              <div className="w-full max-w-[200px] h-1.5 rounded-full bg-primary/20 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Subir las {11 - filledCount > 0 ? `${11 - filledCount} fotos` : "fotos"} de {selectedModel}</span>
              <span className="text-[10px] text-zinc-500 font-normal normal-case">Selecciona hasta 11 fotos a la vez — se guardan solas</span>
            </>
          )}
        </button>

        {/* Vista previa de los 11 slots */}
        <div className="grid grid-cols-4 gap-2 p-3 rounded-xl border border-primary/10 bg-black/30">
          {Array.from({ length: 11 }, (_, i) => {
            const photoUrl = currentPhotos[i] ?? "";
            return (
              <div key={i} className="relative group">
                <span className="absolute top-1 left-1 z-10 text-[9px] font-mono font-bold text-white bg-black/60 rounded px-1 leading-tight">{i + 1}</span>
                {photoUrl ? (
                  <>
                    <img
                      src={photoUrl}
                      alt={`Foto ${i + 1}`}
                      className="w-full aspect-square rounded-lg object-cover border border-primary/30"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute top-1 right-1 z-10 flex flex-col gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400 opacity-70" />
                      <button
                        type="button"
                        onClick={() => handleSlotDelete(i)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500/80 rounded-full p-0.5 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => handleSlotUpload(i)}
                    className="w-full aspect-square rounded-lg border border-dashed border-zinc-700 hover:border-primary/50 hover:bg-primary/10 flex items-center justify-center transition-colors disabled:opacity-40"
                  >
                    <Upload className="w-4 h-4 text-zinc-600" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón de guardado manual (respaldo) */}
        <Button
          onClick={handleManualSave}
          disabled={saving}
          variant="outline"
          className="w-full border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
          Guardar todo manualmente (respaldo)
        </Button>
      </CardContent>
    </Card>
  );
}
