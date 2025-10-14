import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { csvData, fileType, companyName } = await req.json();
    
    console.log(`Processing ${fileType} data for company: ${companyName}`);

    // Parse CSV data
    const rows = csvData.split('\n').map((row: string) => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1).filter((row: string[]) => row.length > 1);

    // Generate analysis prompt based on file type
    const prompts = {
      ventas: `Analiza estos datos de ventas y genera:
1. Métricas clave (ventas totales, ticket promedio, productos más vendidos)
2. Tendencias y patrones estacionales
3. 3 recomendaciones estratégicas para aumentar ventas`,
      
      compras: `Analiza estos datos de compras y genera:
1. Métricas clave (gasto total, proveedores principales, frecuencia de compra)
2. Eficiencia en costos y oportunidades de ahorro
3. 3 recomendaciones para optimizar compras`,
      
      inventarios: `Analiza estos datos de inventario y genera:
1. Métricas clave (rotación, productos lentos/rápidos, nivel de stock)
2. Productos con riesgo de sobrestock o falta de stock
3. 3 recomendaciones para optimizar inventario`,
      
      cuentas_cobrar: `Analiza estos datos de cuentas por cobrar y genera:
1. Métricas clave (cartera total, días promedio de cobro, cartera vencida)
2. Clientes con mayor mora y riesgos
3. 3 recomendaciones para mejorar cobranza`,
      
      cuentas_pagar: `Analiza estos datos de cuentas por pagar y genera:
1. Métricas clave (total a pagar, días promedio de pago, próximos vencimientos)
2. Proyección de flujo de caja
3. 3 recomendaciones para optimizar pagos`
    };

    const systemPrompt = prompts[fileType as keyof typeof prompts];
    
    // Prepare data summary for AI
    const dataSummary = `
Datos de ${fileType} (${data.length} registros):
Columnas: ${headers.join(', ')}

Primeras 10 filas de ejemplo:
${data.slice(0, 10).map((row: string[]) => row.join(', ')).join('\n')}

Estadísticas básicas:
- Total de registros: ${data.length}
- Rango de fechas: ${data[0]?.[0]} a ${data[data.length - 1]?.[0]}
    `;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dataSummary }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Error al analizar con IA');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Extract metrics from AI response (simplified)
    const metrics = {
      totalRecords: data.length,
      dateRange: `${data[0]?.[0]} a ${data[data.length - 1]?.[0]}`,
      columnsAnalyzed: headers.length
    };

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        metrics,
        area: fileType
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-business-data:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});