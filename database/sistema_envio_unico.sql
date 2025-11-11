-- =====================================================
-- SISTEMA DE ENVÍO ÚNICO POR TRIMESTRE
-- Ejecutar en Neon SQL Editor
-- =====================================================

-- CONCEPTO: 
-- El usuario envía TODAS las metas del trimestre EN UN SOLO ENVÍO
-- Se crea 1 registro en envios_trimestre
-- Se crean N registros en evidencias (uno por cada meta)

-- =====================================================
-- 1. CREAR TABLA ENVIOS_TRIMESTRE
-- =====================================================
CREATE TABLE IF NOT EXISTS envios_trimestre (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  anio INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Estado del envío completo
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'completado')),
  
  -- Fechas
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint único: un usuario solo puede hacer un envío por trimestre por año
  UNIQUE(usuario_id, area_id, trimestre, anio)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_envios_usuario ON envios_trimestre(usuario_id);
CREATE INDEX IF NOT EXISTS idx_envios_area_trimestre ON envios_trimestre(area_id, trimestre);
CREATE INDEX IF NOT EXISTS idx_envios_estado ON envios_trimestre(estado);

-- Comentarios
COMMENT ON TABLE envios_trimestre IS 'Registro de envíos completos de evidencias por trimestre';
COMMENT ON COLUMN envios_trimestre.estado IS 'pendiente: enviado pero no revisado | en_revision: admin revisando | completado: todas las metas calificadas';

-- =====================================================
-- 2. MODIFICAR TABLA EVIDENCIAS (agregar referencia al envío)
-- =====================================================
ALTER TABLE evidencias 
ADD COLUMN IF NOT EXISTS envio_id INTEGER REFERENCES envios_trimestre(id) ON DELETE CASCADE;

-- Índice para la nueva relación
CREATE INDEX IF NOT EXISTS idx_evidencias_envio ON evidencias(envio_id);

-- Comentario
COMMENT ON COLUMN evidencias.envio_id IS 'Referencia al envío completo del trimestre';

-- =====================================================
-- 3. VISTA: RESUMEN DE ENVÍOS
-- =====================================================
CREATE OR REPLACE VIEW vista_resumen_envios AS
SELECT 
  et.id as envio_id,
  et.usuario_id,
  u.nombre as usuario_nombre,
  u.email as usuario_correo,
  et.area_id,
  a.nombre_area as area_nombre,
  et.trimestre,
  et.anio,
  et.estado as estado_envio,
  et.fecha_envio,
  
  -- Contar metas del envío
  COUNT(e.id) as total_metas,
  COUNT(CASE WHEN e.estado = 'aprobado' THEN 1 END) as metas_aprobadas,
  COUNT(CASE WHEN e.estado = 'rechazado' THEN 1 END) as metas_rechazadas,
  COUNT(CASE WHEN e.estado = 'pendiente' THEN 1 END) as metas_pendientes,
  
  -- Calificación general del trimestre
  ct.calificacion_general,
  ct.comentario_general
  
FROM envios_trimestre et
JOIN usuarios u ON et.usuario_id = u.id
JOIN areas a ON et.area_id = a.id
LEFT JOIN evidencias e ON et.id = e.envio_id
LEFT JOIN calificaciones_trimestre ct ON et.usuario_id = ct.usuario_id 
  AND et.area_id = ct.area_id 
  AND et.trimestre = ct.trimestre 
  AND et.anio = ct.anio
GROUP BY 
  et.id, et.usuario_id, u.nombre, u.email,
  et.area_id, a.nombre_area, et.trimestre, et.anio,
  et.estado, et.fecha_envio,
  ct.calificacion_general, ct.comentario_general
ORDER BY et.fecha_envio DESC;

-- =====================================================
-- 4. FUNCIÓN: ACTUALIZAR ESTADO DE ENVÍO AUTOMÁTICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_estado_envio()
RETURNS TRIGGER AS $$
DECLARE
  v_envio_id INTEGER;
  v_total_metas INTEGER;
  v_metas_calificadas INTEGER;
BEGIN
  -- Obtener envio_id (de NEW o OLD según la operación)
  IF TG_OP = 'DELETE' THEN
    v_envio_id := OLD.envio_id;
  ELSE
    v_envio_id := NEW.envio_id;
  END IF;

  IF v_envio_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Contar metas totales y calificadas del envío
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN estado IN ('aprobado', 'rechazado') THEN 1 END)
  INTO v_total_metas, v_metas_calificadas
  FROM evidencias
  WHERE envio_id = v_envio_id;

  -- Actualizar estado del envío
  IF v_metas_calificadas = v_total_metas AND v_total_metas > 0 THEN
    -- Todas las metas están calificadas
    UPDATE envios_trimestre 
    SET 
      estado = 'completado',
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = v_envio_id;
  ELSIF v_metas_calificadas > 0 THEN
    -- Algunas metas están calificadas (en revisión)
    UPDATE envios_trimestre 
    SET 
      estado = 'en_revision',
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = v_envio_id;
  ELSE
    -- Ninguna meta calificada aún
    UPDATE envios_trimestre 
    SET 
      estado = 'pendiente',
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = v_envio_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGER: ACTUALIZAR ESTADO CUANDO SE CALIFICA UNA META
-- =====================================================
DROP TRIGGER IF EXISTS trigger_actualizar_estado_envio ON evidencias;
CREATE TRIGGER trigger_actualizar_estado_envio
AFTER INSERT OR UPDATE OR DELETE ON evidencias
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_envio();

-- =====================================================
-- 6. CONSULTAS ÚTILES
-- =====================================================

-- Ver todos los envíos con resumen
-- SELECT * FROM vista_resumen_envios;

-- Ver envíos pendientes de calificar
-- SELECT * FROM vista_resumen_envios WHERE estado_envio = 'pendiente';

-- Ver evidencias de un envío específico
-- SELECT * FROM evidencias WHERE envio_id = 1;

-- Ver usuarios sin envío en un trimestre específico
-- SELECT u.id, u.nombre, u.email, a.nombre_area as area
-- FROM usuarios u
-- JOIN areas a ON u.area_id = a.id
-- WHERE u.rol = 'usuario'
-- AND NOT EXISTS (
--   SELECT 1 FROM envios_trimestre et
--   WHERE et.usuario_id = u.id
--   AND et.trimestre = 3  -- Cambiar según trimestre
--   AND et.anio = 2025
-- );

-- =====================================================
-- ✅ MIGRACIÓN COMPLETA
-- =====================================================
SELECT 'Sistema de envío único configurado correctamente' as mensaje;
