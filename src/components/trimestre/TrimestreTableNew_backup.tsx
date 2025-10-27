'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/FileUpload';
import { 
  ClipboardList, 
  Target, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Send,
  Loader2
} from 'lucide-react';

interface MetaEvidencia {
  id: number;
  meta: string | null;
  indicador: string | null;
  accion: string | null;
  presupuesto: string | null;
  eje_nombre: string;
  sub_eje_nombre: string;
  evidencia_id: number | null;
  evidencia_texto: string | null;
  evidencia_url: string | null;
  estado: string | null;
  observaciones: string | null;
  calificacion: number | null;
  fecha_envio: string | null;
}

interface TrimestreTableProps {
  trimestreId: number;
  areaId: number;
}

export default function TrimestreTable({ trimestreId, areaId }: TrimestreTableProps) {
  const [metas, setMetas] = useState<MetaEvidencia[]>([]);
  const [valores, setValores] = useState<Record<number, { evidencia_texto: string; evidencia_url: string }>>({});
  const [archivos, setArchivos] = useState<Record<number, File | null>>({});
  const [enviando, setEnviando] = useState<number | null>(null);

  const cargarMetas = useCallback(async () => {
    try {
      const res = await fetch(`/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`);
      const data = await res.json();
      
      if (res.ok) {
        setMetas(data.metas || []);
        
        // Pre-cargar valores existentes
        const valoresIniciales: Record<number, { evidencia_texto: string; evidencia_url: string }> = {};
        data.metas?.forEach((meta: MetaEvidencia) => {
          valoresIniciales[meta.id] = {
            evidencia_texto: meta.evidencia_texto || '',
            evidencia_url: meta.evidencia_url || ''
          };
        });
        setValores(valoresIniciales);
      } else {
        toast.error(data.error || 'Error al cargar metas');
      }
    } catch {
      toast.error('Error al cargar metas');
    }
  }, [trimestreId, areaId]);

  useEffect(() => {
    cargarMetas();
  }, [cargarMetas]);

  const handleEnviarEvidencia = async (metaId: number) => {
    const evidencia_texto = valores[metaId]?.evidencia_texto?.trim();
    const archivo = archivos[metaId];
    
    if (!evidencia_texto) {
      toast.error('La descripción de la evidencia es obligatoria');
      return;
    }

    if (!archivo) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    setEnviando(metaId);
    
    try {
      // Subir el archivo a S3 y guardar en tabla evidencias
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('meta_id', metaId.toString());
      formData.append('trimestre', trimestreId.toString());
      formData.append('descripcion', evidencia_texto);

      console.log('📤 Enviando evidencia:', {
        metaId,
        trimestre: trimestreId,
        descripcion: evidencia_texto,
        archivo: archivo.name
      });

      const uploadRes = await fetch('/api/usuario/upload-evidencia', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        console.error('❌ Error al subir:', uploadData);
        toast.error(uploadData.message || 'Error al subir archivo');
        setEnviando(null);
        return;
      }

      console.log('✅ Evidencia enviada:', uploadData);
      toast.success('✅ Evidencia enviada correctamente');
      
      // Limpiar formulario después de enviar
      setArchivos(prev => ({ ...prev, [metaId]: null }));
      setValores(prev => ({ ...prev, [metaId]: { evidencia_texto: '', evidencia_url: '' } }));
      
      // Recargar metas para actualizar estado
      await cargarMetas();
    } catch (error) {
      console.error('❌ Error al enviar evidencia:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar evidencia');
    } finally {
      setEnviando(null);
    }
  };

  if (metas.length === 0) {
    return (
      <div style={{
