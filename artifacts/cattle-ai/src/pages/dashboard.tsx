import { useLanguage } from "@/lib/language-context";
import { useListAnalyses } from "@workspace/api-client-react";
import { getListAnalysesQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, Target, Layers, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  
  // Use list analyses since the stats hook might not be available or we can derive stats from the list easily
  const { data: analyses, isLoading } = useListAnalyses({}, { query: { queryKey: getListAnalysesQueryKey() } });

  // Calculate stats from list
  const total = analyses?.length || 0;
  const currentMonth = new Date().getMonth();
  const thisMonth = analyses?.filter(a => new Date(a.createdAt).getMonth() === currentMonth).length || 0;
  
  const breedCounts = analyses?.reduce((acc, curr) => {
    acc[curr.topBreed] = (acc[curr.topBreed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  let mostCommon = "";
  let maxCount = 0;
  Object.entries(breedCounts).forEach(([breed, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = breed;
    }
  });

  const avgConfidence = analyses?.length 
    ? analyses.reduce((acc, curr) => acc + curr.topConfidence, 0) / analyses.length 
    : 0;

  const chartData = Object.entries(breedCounts)
    .map(([breed, count]) => ({ name: t(breed), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("Dashboard")}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card border-border/50 col-span-4 h-[400px]">
          <CardContent className="p-6 h-full">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">{t("Dashboard")}</h1>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("Total Analyses")}</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{total}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("This Month")}</CardTitle>
              <Layers className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{thisMonth}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("Most Common Breed")}</CardTitle>
              <PieChart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white truncate">{mostCommon ? t(mostCommon) : '-'}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("Avg Confidence")}</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{(avgConfidence * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-4"
        >
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">{t("Breed Distribution")}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout={language === 'ar' ? 'horizontal' : 'horizontal'}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      reversed={language === 'ar'}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`}
                      orientation={language === 'ar' ? 'right' : 'left'}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1F2937', color: '#fff' }} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--primary))" opacity={0.8 + (index * 0.05)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-3"
        >
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">{t("Recent Analyses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyses?.slice(0, 5).map((analysis) => (
                  <div key={analysis.id} className="flex items-center p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/20 transition-colors">
                    {analysis.imageData && (
                      <div className="w-12 h-12 rounded overflow-hidden mr-4 ml-0 shrink-0 border border-border">
                        <img src={analysis.imageData} alt="Cattle" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0" style={{ marginLeft: language === 'ar' ? '0' : '1rem', marginRight: language === 'ar' ? '1rem' : '0' }}>
                      <p className="text-sm font-medium text-white truncate">{t(analysis.topBreed)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="font-mono text-sm text-primary font-medium">
                      {(analysis.topConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
                {(!analyses || analyses.length === 0) && (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    No recent analyses
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
