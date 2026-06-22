import { useState, useRef, useCallback } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLanguage } from "@/lib/language-context";
import { useCreateAnalysis, getListAnalysesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Image as ImageIcon, CheckCircle2, Download, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { exportAnalysisToPDF } from "@/lib/export-pdf";
import { useToast } from "@/hooks/use-toast";

export default function AnalyzePage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const createAnalysis = useCreateAnalysis();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        setFileName(`capture-${new Date().getTime()}.jpg`);
        stopCamera();
      }
    }
  };

  const handleAnalyze = () => {
    if (!image) return;
    
    createAnalysis.mutate(
      { data: { imageData: image, imageName: fileName } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
          toast({
            title: "Analysis Complete",
            description: "Cattle breed has been successfully identified.",
          });
        },
        onError: (error) => {
          toast({
            title: "Analysis Failed",
            description: error.message || "An error occurred during analysis.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const clearImage = () => {
    setImage(null);
    setFileName("");
    createAnalysis.reset();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t("Analyze")}</h1>
        <p className="text-muted-foreground">{t("Upload Image")} or {t("Open Camera")} to identify breed.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {showCamera ? (
              <motion.div 
                key="camera"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-xl overflow-hidden bg-black border border-border shadow-2xl aspect-video flex flex-col"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
                  <Button variant="secondary" onClick={stopCamera}>{t("Cancel")}</Button>
                  <Button onClick={capturePhoto} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Camera className="w-4 h-4 mr-2" />
                    {t("Take Photo")}
                  </Button>
                </div>
              </motion.div>
            ) : image ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-xl overflow-hidden bg-card border border-border shadow-xl aspect-video group"
              >
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="destructive" onClick={clearImage}>
                    <X className="w-4 h-4 mr-2" />
                    {t("Cancel")}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <label
                  className={`
                    flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card/30 hover:bg-card/50 hover:border-primary/50'}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="mb-2 text-lg font-medium text-white">{t("Drag and drop an image here")}</p>
                    <p className="text-sm text-muted-foreground">{t("or click to select")}</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
                </label>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex-1 h-px bg-border/50"></div>
                  <span className="text-xs text-muted-foreground uppercase font-medium">OR</span>
                  <div className="flex-1 h-px bg-border/50"></div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 h-12 bg-card border-border hover:border-primary/50 hover:bg-primary/5"
                  onClick={startCamera}
                >
                  <Camera className="w-5 h-5 mr-2 text-primary" />
                  {t("Open Camera")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {image && !createAnalysis.data && !showCamera && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button 
                className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(61,237,151,0.2)] hover:shadow-[0_0_30px_rgba(61,237,151,0.4)] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAnalyze}
                disabled={createAnalysis.isPending}
              >
                {createAnalysis.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t("Analyze Button")}
                  </span>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {createAnalysis.isPending && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center space-y-6 py-12"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">Neural Network Active</h3>
                  <p className="text-muted-foreground">Extracting phenotypic features...</p>
                </div>
              </motion.div>
            )}

            {createAnalysis.data && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-card/50 backdrop-blur-xl border-primary/30 shadow-[0_0_30px_rgba(61,237,151,0.1)] overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("Top Breed")}</p>
                        <h2 className="text-3xl font-bold text-white">{t(createAnalysis.data.topBreed)}</h2>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-primary">{(createAnalysis.data.topConfidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {createAnalysis.data.predictions.map((p, i) => (
                        <motion.div 
                          key={p.breed}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "100%" }}
                          transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span className={i === 0 ? "text-white font-medium" : "text-muted-foreground"}>{t(p.breed)}</span>
                            <span className={i === 0 ? "text-primary font-mono" : "text-muted-foreground font-mono"}>{(p.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={p.confidence * 100} 
                            className={`h-2 bg-muted ${i === 0 ? '[&>div]:bg-primary shadow-[0_0_10px_rgba(61,237,151,0.3)]' : '[&>div]:bg-muted-foreground'}`}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <Button 
                      className="w-full mt-8 bg-card border border-border hover:border-primary hover:text-primary transition-all"
                      variant="outline"
                      onClick={() => {
                        exportAnalysisToPDF(createAnalysis.data!, t).catch(() => {});
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t("Export PDF")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!createAnalysis.isPending && !createAnalysis.data && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-card/20"
              >
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Awaiting Image</h3>
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  Upload an image or take a photo to see the neural network's predictions.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
