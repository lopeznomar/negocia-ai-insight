import { useState, useEffect } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Auth } from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, BarChart3, LogOut } from "lucide-react";

type AnalysisArea = "ventas" | "compras" | "inventarios" | "cuentas_cobrar" | "cuentas_pagar";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Record<AnalysisArea, File | null>>({
    ventas: null,
    compras: null,
    inventarios: null,
    cuentas_cobrar: null,
    cuentas_pagar: null,
  });
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleFileUpload = (area: AnalysisArea, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [area]: file }));
    toast({
      title: "Archivo cargado",
      description: `${file.name} listo para analizar`,
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async () => {
    const filesToAnalyze = Object.entries(uploadedFiles).filter(([_, file]) => file !== null);
    
    if (filesToAnalyze.length === 0) {
      toast({
        title: "No hay archivos",
        description: "Por favor sube al menos un archivo para analizar",
        variant: "destructive",
      });
      return;
    }

    if (!companyName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa el nombre de tu empresa",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const results = [];

    try {
      for (const [fileType, file] of filesToAnalyze) {
        if (!file) continue;
        
        const csvData = await readFileAsText(file);

        const { data, error } = await supabase.functions.invoke('analyze-business-data', {
          body: {
            csvData,
            fileType,
            companyName
          }
        });

        if (error) throw error;

        if (data?.success) {
          results.push({
            area: data.area,
            analysis: data.analysis,
            metrics: data.metrics
          });
        }
      }

      setAnalysisResults(results);
      
      toast({
        title: "Análisis completado",
        description: `Se analizaron ${results.length} áreas de tu negocio`,
      });

    } catch (error) {
      console.error('Error al analizar:', error);
      toast({
        title: "Error en el análisis",
        description: "No se pudo completar el análisis. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">NegocIA</h1>
                <p className="text-sm text-muted-foreground">Análisis Inteligente para tu Empresa</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                <Sparkles className="h-3 w-3 mr-1" />
                Con IA
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Sección de carga */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Carga tus datos empresariales</h2>
            <p className="text-muted-foreground">
              Sube archivos CSV o Excel de diferentes áreas de tu negocio
            </p>
          </div>

          {/* Company Name Input */}
          <div className="max-w-md mx-auto mb-8">
            <Input
              type="text"
              placeholder="Nombre de tu empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-center text-lg"
              disabled={isAnalyzing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <FileUploadZone
              icon="📊"
              title="Ventas"
              onFileUpload={(file) => handleFileUpload("ventas", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="🛒"
              title="Compras"
              onFileUpload={(file) => handleFileUpload("compras", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="📦"
              title="Inventarios"
              onFileUpload={(file) => handleFileUpload("inventarios", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="💰"
              title="Cuentas por Cobrar"
              onFileUpload={(file) => handleFileUpload("cuentas_cobrar", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="📋"
              title="Cuentas por Pagar"
              onFileUpload={(file) => handleFileUpload("cuentas_pagar", file)}
              disabled={isAnalyzing}
            />
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="gradient-primary text-lg px-8 shadow-lg hover:shadow-xl transition-all"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              {isAnalyzing ? "Analizando con IA..." : "Analizar Negocio"}
            </Button>
          </div>
        </section>

        {/* Sección de resultados */}
        {analysisResults.length > 0 && (
          <section className="mb-12">
            <AnalysisResults results={analysisResults} />
          </section>
        )}

        {/* Sección de tarjetas de análisis (demo) */}
        {analysisResults.length === 0 && (
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Vista Previa de Análisis</h2>
              <p className="text-muted-foreground">
                Ejemplo de métricas que obtendrás al cargar tus datos
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsCard
                title="Ventas"
                icon="📊"
                description="Análisis de tendencias y productos"
                isLoading={false}
                hasData={false}
                metrics={[
                  { label: "Ingresos Mensuales", value: "$125,430", trend: "up", trendValue: "+15%" },
                  { label: "Top Producto", value: "Producto A", trend: "up", trendValue: "28%" },
                ]}
                recommendations={[
                  "Incrementar inventario del Producto A por alta demanda",
                  "Implementar promoción en temporada baja",
                ]}
              />

              <AnalyticsCard
                title="Compras"
                icon="🛒"
                description="Eficiencia y análisis de proveedores"
                isLoading={false}
                hasData={false}
                metrics={[
                  { label: "Gasto Mensual", value: "$87,200", trend: "down", trendValue: "-5%" },
                  { label: "Ahorro Potencial", value: "$4,300", trend: "up", trendValue: "5%" },
                ]}
                recommendations={[
                  "Negociar descuentos por volumen",
                  "Evaluar proveedores alternativos",
                ]}
              />

              <AnalyticsCard
                title="Inventarios"
                icon="📦"
                description="Rotación y optimización de stock"
                isLoading={false}
                hasData={false}
                metrics={[
                  { label: "Valor Inventario", value: "$234,500", trend: "up", trendValue: "+12%" },
                  { label: "Rotación Promedio", value: "45 días", trend: "down", trendValue: "-5d" },
                ]}
                recommendations={[
                  "Reducir stock de productos de baja rotación",
                  "Implementar sistema Just-in-Time",
                ]}
              />

              <AnalyticsCard
                title="Cuentas por Cobrar"
                icon="💰"
                description="Gestión de cobranza y cartera"
                isLoading={false}
                hasData={false}
                metrics={[
                  { label: "Cartera Total", value: "$156,800", trend: "up", trendValue: "+8%" },
                  { label: "Días Promedio", value: "42 días", trend: "down", trendValue: "-3d" },
                ]}
                recommendations={[
                  "Implementar descuentos por pronto pago",
                  "Automatizar recordatorios de pago",
                ]}
              />

              <AnalyticsCard
                title="Cuentas por Pagar"
                icon="📋"
                description="Flujo de caja y obligaciones"
                isLoading={false}
                hasData={false}
                metrics={[
                  { label: "Obligaciones", value: "$98,600", trend: "down", trendValue: "-10%" },
                  { label: "Vencen 7 días", value: "$15,200", trend: "neutral", trendValue: "0%" },
                ]}
                recommendations={[
                  "Aprovechar términos de pago extendidos",
                  "Planificar flujo para próximos vencimientos",
                ]}
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 NegocIA. Análisis empresarial potenciado por IA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Badge component inline
const Badge = ({ children, variant = "default", className = "" }: { 
  children: React.ReactNode; 
  variant?: "default" | "outline";
  className?: string;
}) => (
  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
    variant === "outline" ? "border border-border" : "bg-primary/10 text-primary"
  } ${className}`}>
    {children}
  </div>
);

export default Index;