-- =========================================================
-- Documentos requeridos por trámite SAT
-- =========================================================

-- 1. Creación de NIT
update app_variants set
  requires_documents = $$[
    {"name":"dpi_frente","label":"Foto de DPI (frente)","required":true,"type":"image"},
    {"name":"dpi_reverso","label":"Foto de DPI (reverso)","required":true,"type":"image"},
    {"name":"foto_selfie","label":"Selfie sosteniendo tu DPI","required":true,"type":"image"},
    {"name":"direccion","label":"Dirección completa de residencia","required":true,"type":"text"},
    {"name":"telefono","label":"Teléfono / WhatsApp","required":true,"type":"tel"},
    {"name":"correo","label":"Correo electrónico","required":true,"type":"email"},
    {"name":"actividad","label":"Actividad económica que vas a realizar","required":true,"type":"textarea"},
    {"name":"regimen","label":"Régimen fiscal preferido (si sabes)","required":false,"type":"text"}
  ]$$::jsonb,
  fulfillment_instructions = 'Para tu Creación de NIT necesitamos foto de tu DPI (ambos lados), una selfie sosteniendo tu DPI, dirección, teléfono, correo y a qué te vas a dedicar. Si no sabes qué régimen elegir, nosotros te asesoramos.',
  estimated_delivery = '24-48 horas'
where slug = 'creacion-nit';

-- 2. Creación de Agencia Virtual
update app_variants set
  requires_documents = $$[
    {"name":"nit","label":"Número de NIT","required":true,"type":"text"},
    {"name":"dpi_frente","label":"Foto de DPI (frente)","required":true,"type":"image"},
    {"name":"correo","label":"Correo electrónico para registrar","required":true,"type":"email"},
    {"name":"telefono","label":"Teléfono / WhatsApp","required":true,"type":"tel"},
    {"name":"pregunta_seguridad","label":"Pregunta de seguridad preferida (mascota, lugar, etc.)","required":false,"type":"text"}
  ]$$::jsonb,
  fulfillment_instructions = 'Para crear tu Agencia Virtual necesitamos tu NIT, foto del DPI, correo donde se registrará y teléfono. Una vez activada te enviamos usuario, contraseña y guía de uso.',
  estimated_delivery = '24 horas'
where slug = 'creacion-agencia-virtual';

-- 3. Actualización de RTU
update app_variants set
  requires_documents = $$[
    {"name":"nit","label":"Número de NIT","required":true,"type":"text"},
    {"name":"dpi_frente","label":"Foto de DPI (frente)","required":true,"type":"image"},
    {"name":"que_actualizar","label":"¿Qué datos quieres actualizar?","required":true,"type":"textarea","placeholder":"Ej: dirección, teléfono, actividad económica, etc."},
    {"name":"datos_nuevos","label":"Datos nuevos (los que reemplazarán a los actuales)","required":true,"type":"textarea"},
    {"name":"telefono","label":"Teléfono / WhatsApp","required":true,"type":"tel"}
  ]$$::jsonb,
  fulfillment_instructions = 'Para actualizar tu RTU necesitamos tu NIT, foto del DPI, y especificar qué datos quieres cambiar y los datos nuevos. Trámite rápido.',
  estimated_delivery = '12-24 horas'
where slug = 'actualizacion-rtu';

-- 4. Recuperación de Agencia Virtual
update app_variants set
  requires_documents = $$[
    {"name":"nit","label":"Número de NIT","required":true,"type":"text"},
    {"name":"dpi_frente","label":"Foto de DPI (frente)","required":true,"type":"image"},
    {"name":"dpi_reverso","label":"Foto de DPI (reverso)","required":true,"type":"image"},
    {"name":"foto_selfie","label":"Selfie sosteniendo tu DPI","required":true,"type":"image"},
    {"name":"correo_actual","label":"Correo registrado en Agencia Virtual (si lo recuerdas)","required":false,"type":"email"},
    {"name":"correo_nuevo","label":"Correo donde recibirás nuevas credenciales","required":true,"type":"email"},
    {"name":"telefono","label":"Teléfono / WhatsApp","required":true,"type":"tel"},
    {"name":"motivo","label":"¿Por qué necesitas recuperarla?","required":true,"type":"textarea","placeholder":"Olvidé contraseña / cuenta bloqueada / etc."}
  ]$$::jsonb,
  fulfillment_instructions = 'Para recuperar tu Agencia Virtual necesitamos validar tu identidad con DPI + selfie, motivo del bloqueo y un correo donde te enviaremos las nuevas credenciales.',
  estimated_delivery = '24-48 horas'
where slug = 'recuperacion-agencia-virtual';

-- Verificación
select
  v.name as tramite,
  jsonb_array_length(v.requires_documents) as num_documentos,
  v.estimated_delivery as entrega_estimada
from app_variants v
where v.app_id = (select id from apps where slug = 'servicio-sat')
order by v.display_order;
