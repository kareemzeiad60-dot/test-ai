import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useListAnalyses, useDeleteAnalysis, getListAnalysesQueryKey, Analysis } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, Search, Activity, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportAnalysisToPDF } from "@/lib/export-pdf";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  const { data: analyses, isLoading } = useListAnalyses({}, { query: { queryKey: getListAnalysesQueryKey() } });
  const deleteAnalysis = useDeleteAnalysis();

  const filteredAnalyses = analyses?.filter(a => 
    t(a.topBreed).toLowerCase().includes(search.toLowerCase()) || 
    new Date(a.createdAt).toLocaleDateString().includes(search)
  ) || [];

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteAnalysis.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
          toast({ title: "Analysis deleted" });
          if (selectedAnalysis?.id === id) {
            setSelectedAnalysis(null);
          }
        },
        onError: () => {
          toast({ title: "Failed to delete", variant: "destructive" });
        }
      }
    );
  };

  const handleExport = (e: React.MouseEvent, analysis: Analysis) => {
    e.stopPropagation();
    exportAnalysisToPDF(analysis, t).catch(() => {});
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t("History")}</h1>
          <p className="text-muted-foreground">Past analyses and detailed predictions.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search breed or date..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50 focus-visible:ring-primary/50 text-white"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50 h-[300px]">
              <CardHeader className="p-0">
                <Skeleton className="h-40 w-full rounded-t-lg rounded-b-none" />
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-2 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4 border border-border">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No analyses found</h3>
          <p className="text-muted-foreground">Upload an image in the Analyze tab to get started.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence>
            {filteredAnalyses.map(analysis => (
              <motion.div 
                key={analysis.id} 
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card 
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all cursor-pointer shadow-lg group overflow-hidden flex flex-col h-full"
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <CardHeader className="p-0 relative h-40 shrink-0 bg-black">
                    {analysis.imageData ? (
                      <img src={analysis.imageData} alt="Cattle" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/20">
                        <Activity className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="w-8 h-8 bg-black/50 backdrop-blur hover:bg-black/70 text-white" onClick={(e) => handleExport(e, analysis)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="w-8 h-8 bg-destructive/80 backdrop-blur hover:bg-destructive text-white" onClick={(e) => handleDelete(e, analysis.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-white truncate pr-2">{t(analysis.topBreed)}</h3>
                      <span className="font-mono text-primary font-bold">{(analysis.topConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-auto">
                      <Progress 
                        value={analysis.topConfidence * 100} 
                        className="h-1.5 bg-muted [&>div]:bg-primary shadow-[0_0_5px_rgba(61,237,151,0.2)]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <DialogContent className="bg-card border-border/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Analysis Details</DialogTitle>
          </DialogHeader>
          
          {selectedAnalysis && (
            <div className="space-y-6">
              {selectedAnalysis.imageData && (
                <div className="w-full h-64 rounded-lg overflow-hidden bg-black border border-border">
                  <img src={selectedAnalysis.imageData} alt="Cattle" className="w-full h-full object-contain" />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("Date")}</p>
                  <p className="font-medium text-white">{new Date(selectedAnalysis.createdAt).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary/80 mb-1">{t("Top Breed")}</p>
                  <p className="font-bold text-xl text-primary">{t(selectedAnalysis.topBreed)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-white border-b border-border/50 pb-2">Full Predictions</h4>
                <div className="space-y-4">
                  {selectedAnalysis.predictions.map((p, i) => (
                    <div key={p.breed}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={i === 0 ? "text-white font-medium" : "text-muted-foreground"}>{t(p.breed)}</span>
                        <span className={i === 0 ? "text-primary font-mono" : "text-muted-foreground font-mono"}>{(p.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={p.confidence * 100} 
                        className={`h-2 bg-muted ${i === 0 ? '[&>div]:bg-primary shadow-[0_0_10px_rgba(61,237,151,0.2)]' : '[&>div]:bg-muted-foreground'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button variant="outline" className="bg-transparent border-border hover:bg-white/5" onClick={() => exportAnalysisToPDF(selectedAnalysis, t)}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("Export PDF")}
                </Button>
                <Button variant="destructive" onClick={(e) => handleDelete(e, selectedAnalysis.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("Delete")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
