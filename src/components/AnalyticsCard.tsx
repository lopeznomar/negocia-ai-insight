import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface AnalyticsCardProps {
  title: string;
  icon: string;
  description: string;
  isLoading?: boolean;
  hasData?: boolean;
  metrics?: Metric[];
  recommendations?: string[];
}

export const AnalyticsCard = ({
  title,
  icon,
  description,
  isLoading,
  hasData,
  metrics = [],
  recommendations = []
}: AnalyticsCardProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{icon}</div>
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className="shadow-card border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-3xl opacity-50">{icon}</div>
            <div className="flex-1">
              <CardTitle className="text-muted-foreground">{title}</CardTitle>
              <CardDescription>Esperando datos...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sube un archivo para ver el análisis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{metric.value}</p>
                {metric.trend && (
                  <Badge variant={metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "secondary"} className="text-xs">
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : metric.trend === "down" ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : null}
                    {metric.trendValue}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico placeholder */}
        <div className="h-40 rounded-lg bg-muted/30 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Gráfico de {title}</p>
        </div>

        {/* Recomendaciones IA */}
        {recommendations.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="text-accent">✨</span>
              Recomendaciones IA
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
