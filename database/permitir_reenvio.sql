-- =====================================================
-- SOLUCIÓN 1: PERMITIR REENVÍO SI NO HAY CALIFICACIONES
-- =====================================================

-- 1. Función para verificar si el envío puede ser eliminado
CREATE OR REPLACE FUNCTION puede_reenviar_trimestre(p_usuario_id INTEGER, p_trimestre INTEGER, p_anio INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_envio_id INTEGER;
  v_metas_calificadas INTEGER;
BEGIN
  -- Buscar el envío
  SELECT id INTO v_envio_id
  FROM envios_trimestre
  WHERE usuario_id = p_usuario_id 
    AND trimestre = p_trimestre 
    AND anio = p_anio;
  
  IF v_envio_id IS NULL THEN
    RETURN TRUE; -- No hay envío, puede enviar
  END IF;
  
  -- Contar cuántas metas han sido calificadas
  SELECT COUNT(*) INTO v_metas_calificadas
  FROM evidencias
  WHERE envio_id = v_envio_id
    AND estado IN ('aprobado', 'rechazado');
  
  -- Puede reenviar solo si NO hay metas calificadas
  RETURN v_metas_calificadas = 0;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para eliminar envío y permitir reenvío
CREATE OR REPLACE FUNCTION eliminar_envio_y_reenviar(
  p_usuario_id INTEGER, 
  p_trimestre INTEGER, 
  p_anio INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_envio_id INTEGER;
  v_puede_eliminar BOOLEAN;
  v_metas_eliminadas INTEGER;
BEGIN
  -- Verificar si puede reenviar
  v_puede_eliminar := puede_reenviar_trimestre(p_usuario_id, p_trimestre, p_anio);
  
  IF NOT v_puede_eliminar THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No puedes eliminar este envío porque el administrador ya ha calificado algunas metas'
    );
  END IF;
  
  -- Obtener ID del envío
  SELECT id INTO v_envio_id
  FROM envios_trimestre
  WHERE usuario_id = p_usuario_id 
    AND trimestre = p_trimestre 
    AND anio = p_anio;
  
  IF v_envio_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No existe envío para eliminar'
    );
  END IF;
  
  -- Contar metas a eliminar
  SELECT COUNT(*) INTO v_metas_eliminadas
  FROM evidencias
  WHERE envio_id = v_envio_id;
  
  -- Eliminar evidencias primero
  DELETE FROM evidencias WHERE envio_id = v_envio_id;
  
  -- Eliminar el envío
  DELETE FROM envios_trimestre WHERE id = v_envio_id;
  
  RETURN json_build_object(
    'success', true,
    'mensaje', 'Envío eliminado exitosamente. Ahora puedes volver a enviar.',
    'metas_eliminadas', v_metas_eliminadas
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Verificar si un usuario puede reenviar
-- SELECT puede_reenviar_trimestre(1, 3, 2025);

-- Eliminar envío y permitir reenvío
-- SELECT eliminar_envio_y_reenviar(1, 3, 2025);

-- Ver envíos que pueden ser reeditados (sin calificaciones)
SELECT 
  et.id,
  u.nombre,
  et.trimestre,
  COUNT(e.id) as total_metas,
  COUNT(CASE WHEN e.estado IN ('aprobado', 'rechazado') THEN 1 END) as metas_calificadas,
  CASE 
    WHEN COUNT(CASE WHEN e.estado IN ('aprobado', 'rechazado') THEN 1 END) = 0 
    THEN '✅ Puede reenviar'
    ELSE '❌ Ya tiene calificaciones'
  END as estado_reenvio
FROM envios_trimestre et
JOIN usuarios u ON et.usuario_id = u.id
LEFT JOIN evidencias e ON et.id = e.envio_id
GROUP BY et.id, u.nombre, et.trimestre
ORDER BY et.fecha_envio DESC;
