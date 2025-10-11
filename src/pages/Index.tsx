import { useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type AnalysisArea = "sales" | "purchases" | "inventory" | "receivables" | "payables";

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<AnalysisArea, File | null>>({
    sales: null,
    purchases: null,
    inventory: null,
    receivables: null,
    payables: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleFileUpload = (area: AnalysisArea, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [area]: file }));
    toast.success(`Archivo "${file.name}" cargado para ${getAreaLabel(area)}`);
  };

  const handleAnalyze = () => {
    const uploadedCount = Object.values(uploadedFiles).filter(f => f !== null).length;
    
    if (uploadedCount === 0) {
      toast.error("Por favor sube al menos un archivo para analizar");
      return;
    }

    setIsAnalyzing(true);
    toast.loading("Analizando datos con IA...", { duration: 2000 });

    // Simular análisis
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      toast.success(`¡Análisis completado! ${uploadedCount} áreas procesadas`);
    }, 2500);
  };

  const getAreaLabel = (area: AnalysisArea): string => {
    const labels: Record<AnalysisArea, string> = {
      sales: "Ventas",
      purchases: "Compras",
      inventory: "Inventarios",
      receivables: "Cuentas por Cobrar",
      payables: "Cuentas por Pagar",
    };
    return labels[area];
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <FileUploadZone
              icon="📊"
              title="Ventas"
              onFileUpload={(file) => handleFileUpload("sales", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="🛒"
              title="Compras"
              onFileUpload={(file) => handleFileUpload("purchases", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="📦"
              title="Inventarios"
              onFileUpload={(file) => handleFileUpload("inventory", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="💰"
              title="Cuentas por Cobrar"
              onFileUpload={(file) => handleFileUpload("receivables", file)}
              disabled={isAnalyzing}
            />
            <FileUploadZone
              icon="📋"
              title="Cuentas por Pagar"
              onFileUpload={(file) => handleFileUpload("payables", file)}
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
              {isAnalyzing ? "Analizando..." : "Analizar Negocio"}
            </Button>
          </div>
        </section>

        {/* Sección de análisis */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Análisis por Área</h2>
            <p className="text-muted-foreground">
              Métricas clave y recomendaciones personalizadas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsCard
              title="Ventas"
              icon="📊"
              description="Análisis de tendencias y productos"
              isLoading={isAnalyzing}
              hasData={hasAnalyzed && uploadedFiles.sales !== null}
              metrics={[
                { label: "Ingresos Mensuales", value: "$125,430", trend: "up", trendValue: "+15%" },
                { label: "Top Producto", value: "Producto A", trend: "up", trendValue: "28%" },
                { label: "Ticket Promedio", value: "$2,450", trend: "up", trendValue: "+8%" },
                { label: "Conversión", value: "12.5%", trend: "neutral", trendValue: "0%" },
              ]}
              recommendations={[
                "Incrementar inventario del Producto A por alta demanda",
                "Implementar promoción en temporada baja (Marzo-Mayo)",
                "Optimizar estrategia de precios en productos de baja rotación"
              ]}
            />

            <AnalyticsCard
              title="Compras"
              icon="🛒"
              description="Eficiencia y análisis de proveedores"
              isLoading={isAnalyzing}
              hasData={hasAnalyzed && uploadedFiles.purchases !== null}
              metrics={[
                { label: "Gasto Mensual", value: "$87,200", trend: "down", trendValue: "-5%" },
                { label: "Proveedores Activos", value: "12", trend: "neutral", trendValue: "0%" },
                { label: "Ahorro Potencial", value: "$4,300", trend: "up", trendValue: "5%" },
                { label: "Tiempo Entrega", value: "8 días", trend: "down", trendValue: "-2d" },
              ]}
              recommendations={[
                "Negociar descuentos por volumen con Proveedor B",
                "Reducir proveedores de bajo volumen para mejores términos",
                "Evaluar proveedores alternativos para materias primas clave"
              ]}
            />

            <AnalyticsCard
              title="Inventarios"
              icon="📦"
              description="Rotación y optimización de stock"
              isLoading={isAnalyzing}
              hasData={hasAnalyzed && uploadedFiles.inventory !== null}
              metrics={[
                { label: "Valor Inventario", value: "$234,500", trend: "up", trendValue: "+12%" },
                { label: "Rotación Promedio", value: "45 días", trend: "down", trendValue: "-5d" },
                { label: "Stock Crítico", value: "3 items", trend: "neutral", trendValue: "0" },
                { label: "Obsolescencia", value: "2.3%", trend: "down", trendValue: "-0.5%" },
              ]}
              recommendations={[
                "Reducir stock de Producto C por baja rotación (90+ días)",
                "Implementar sistema Just-in-Time para productos de alta demanda",
                "Revisar niveles mínimos de seguridad para evitar quiebres"
              ]}
            />

            <AnalyticsCard
              title="Cuentas por Cobrar"
              icon="💰"
              description="Gestión de cobranza y cartera"
              isLoading={isAnalyzing}
              hasData={hasAnalyzed && uploadedFiles.receivables !== null}
              metrics={[
                { label: "Cartera Total", value: "$156,800", trend: "up", trendValue: "+8%" },
                { label: "Días Promedio", value: "42 días", trend: "down", trendValue: "-3d" },
                { label: "Cartera Vencida", value: "$12,400", trend: "down", trendValue: "-15%" },
                { label: "Eficiencia", value: "92%", trend: "up", trendValue: "+3%" },
              ]}
              recommendations={[
                "Implementar descuentos por pronto pago (2% en 10 días)",
                "Contactar 5 clientes con mora mayor a 60 días",
                "Automatizar recordatorios de pago por email/SMS"
              ]}
            />

            <AnalyticsCard
              title="Cuentas por Pagar"
              icon="📋"
              description="Flujo de caja y obligaciones"
              isLoading={isAnalyzing}
              hasData={hasAnalyzed && uploadedFiles.payables !== null}
              metrics={[
                { label: "Obligaciones", value: "$98,600", trend: "down", trendValue: "-10%" },
                { label: "Días Promedio", value: "38 días", trend: "up", trendValue: "+2d" },
                { label: "Vencen 7 días", value: "$15,200", trend: "neutral", trendValue: "0%" },
                { label: "Cashflow Score", value: "A-", trend: "up", trendValue: "+1" },
              ]}
              recommendations={[
                "Aprovechar términos de pago extendidos con 3 proveedores",
                "Priorizar pagos con descuentos por pronto pago",
                "Planificar flujo para cubrir vencimientos de próximos 30 días"
              ]}
            />
          </div>
        </section>
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

// Badge component inline para evitar importación extra
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
