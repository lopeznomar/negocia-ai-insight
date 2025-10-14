import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Package, Clock, AlertCircle } from "lucide-react";

interface AnalysisResult {
  area: string;
  analysis: string;
  metrics: {
    totalRecords: number;
    dateRange: string;
    columnsAnalyzed: number;
  };
}

interface AnalysisResultsProps {
  results: AnalysisResult[];
}

const areaConfig = {
  ventas: {
    title: "Análisis de Ventas",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  compras: {
    title: "Análisis de Compras",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  inventarios: {
    title: "Análisis de Inventarios",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  cuentas_cobrar: {
    title: "Cuentas por Cobrar",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  cuentas_pagar: {
    title: "Cuentas por Pagar",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50"
  }
};

export const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Resultados del Análisis
        </h2>
        <p className="text-muted-foreground">
          Análisis generado por IA con recomendaciones estratégicas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((result, index) => {
          const config = areaConfig[result.area as keyof typeof areaConfig];
          const Icon = config.icon;

          return (
            <Card key={index} className="shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader className={`${config.bgColor} rounded-t-lg`}>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm ${config.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={config.color}>{config.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Métricas */}
                <div className="flex gap-2 flex-wrap mb-4">
                  <Badge variant="secondary">
                    {result.metrics.totalRecords} registros
                  </Badge>
                  <Badge variant="secondary">
                    {result.metrics.columnsAnalyzed} columnas
                  </Badge>
                </div>
                
                {/* Rango de fechas */}
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium">Periodo:</span> {result.metrics.dateRange}
                </div>

                {/* Análisis de IA */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {result.analysis}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};