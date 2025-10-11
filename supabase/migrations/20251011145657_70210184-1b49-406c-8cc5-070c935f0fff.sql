-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-files',
  'business-files',
  false,
  10485760, -- 10MB limit
  ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Create table for business analysis
CREATE TABLE public.business_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for uploaded files
CREATE TABLE public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES public.business_analysis(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('ventas', 'compras', 'inventarios', 'cuentas_cobrar', 'cuentas_pagar')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for analysis results by area
CREATE TABLE public.analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES public.business_analysis(id) ON DELETE CASCADE,
  area TEXT NOT NULL CHECK (area IN ('ventas', 'compras', 'inventarios', 'cuentas_cobrar', 'cuentas_pagar')),
  metrics JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT,
  insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.business_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_analysis
CREATE POLICY "Users can view their own analysis"
  ON public.business_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis"
  ON public.business_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis"
  ON public.business_analysis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis"
  ON public.business_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for uploaded_files
CREATE POLICY "Users can view files from their analysis"
  ON public.uploaded_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_analysis
      WHERE id = uploaded_files.analysis_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files to their analysis"
  ON public.uploaded_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_analysis
      WHERE id = uploaded_files.analysis_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for analysis_results
CREATE POLICY "Users can view results from their analysis"
  ON public.analysis_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_analysis
      WHERE id = analysis_results.analysis_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create results for their analysis"
  ON public.analysis_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_analysis
      WHERE id = analysis_results.analysis_id
      AND user_id = auth.uid()
    )
  );

-- Storage policies for business-files bucket
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'business-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for business_analysis
CREATE TRIGGER update_business_analysis_updated_at
  BEFORE UPDATE ON public.business_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_business_analysis_user_id ON public.business_analysis(user_id);
CREATE INDEX idx_business_analysis_status ON public.business_analysis(status);
CREATE INDEX idx_uploaded_files_analysis_id ON public.uploaded_files(analysis_id);
CREATE INDEX idx_analysis_results_analysis_id ON public.analysis_results(analysis_id);
CREATE INDEX idx_analysis_results_area ON public.analysis_results(area);