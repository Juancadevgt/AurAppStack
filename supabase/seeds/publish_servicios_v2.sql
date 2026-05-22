-- =========================================================
-- Re-publicar servicios con variantes (sub-tarjetas)
--
-- ⚠️ ANTES: Ejecuta primero 005_app_variants.sql
-- ⚠️ Reemplaza 'juancadevgt@gmail.com' por tu email real
-- =========================================================

-- 1. Borrar "Desarrollo de Software" (lo absorbe "Sistema a la Medida")
delete from apps where slug = 'desarrollo-software';

-- 2. Asegurar que apps tienen has_variants = true cuando corresponda
update apps set has_variants = true
where slug in ('servicio-sat', 'sistema-medida', 'analitica-datos', 'soporte-tecnico-remoto', 'desbloqueo-celulares', 'pagina-web', 'desarrollo-juego');

-- 3. Variantes para SERVICIO SAT
delete from app_variants where app_id = (select id from apps where slug = 'servicio-sat');

insert into app_variants (app_id, slug, name, description, price_cents, type, display_order) values
  ((select id from apps where slug = 'servicio-sat'), 'nit', 'Solicitar NIT',
   'Trámite completo de inscripción de NIT con SAT (incluye documentos y seguimiento).', 1000, 'fixed', 1),
  ((select id from apps where slug = 'servicio-sat'), 'cambio-direccion', 'Cambio de dirección fiscal',
   'Actualización de domicilio fiscal en SAT.', 1500, 'fixed', 2),
  ((select id from apps where slug = 'servicio-sat'), 'cambio-razon-social', 'Cambio de razón social',
   'Modificación de nombre comercial o razón social.', 2000, 'fixed', 3),
  ((select id from apps where slug = 'servicio-sat'), 'inscripcion-contribuyente', 'Inscripción de contribuyente',
   'Alta de nuevo contribuyente (PN o PJ).', 2500, 'fixed', 4),
  ((select id from apps where slug = 'servicio-sat'), 'activacion-fel', 'Activación FEL',
   'Configuración completa de Facturación Electrónica en Línea.', 3000, 'fixed', 5),
  ((select id from apps where slug = 'servicio-sat'), 'declaracion-mensual', 'Declaración mensual',
   'Preparación y envío de declaración mensual (IVA, ISR pequeño contribuyente).', 2500, 'fixed', 6),
  ((select id from apps where slug = 'servicio-sat'), 'firma-electronica', 'Firma electrónica / DPI',
   'Trámite de firma electrónica y configuración digital.', 1500, 'fixed', 7),
  ((select id from apps where slug = 'servicio-sat'), 'baja-sat', 'Baja del SAT',
   'Cese de actividades y baja del padrón.', 2000, 'fixed', 8),
  ((select id from apps where slug = 'servicio-sat'), 'otros', 'Otro trámite SAT',
   'Trámite no listado — cotízalo describiendo lo que necesitas.', null, 'quote', 99);

-- Actualiza el tagline de la card principal
update apps set tagline = 'Precio por trámite específico — desde $10 USD'
where slug = 'servicio-sat';

-- 4. Variantes para SISTEMA A LA MEDIDA (reemplaza "Desarrollo de Software")
delete from app_variants where app_id = (select id from apps where slug = 'sistema-medida');

insert into app_variants (app_id, slug, name, description, price_cents, type, quote_form_fields, quote_instructions, display_order) values
  ((select id from apps where slug = 'sistema-medida'), 'sistema-completo', 'Sistema empresarial completo',
   'ERP completo a la medida de tu negocio (CRM + inventario + facturación + reportes).', null, 'quote',
   '[
     {"name":"empresa","label":"Nombre de tu empresa","type":"text","required":true},
     {"name":"industria","label":"Industria/Sector","type":"text","required":true},
     {"name":"empleados","label":"Número de empleados","type":"select","options":["1-5","6-20","21-50","51-200","200+"],"required":true},
     {"name":"modulos","label":"¿Qué módulos necesitas?","type":"textarea","placeholder":"Ej: CRM, inventario, facturación electrónica, etc.","required":true},
     {"name":"presupuesto","label":"Rango de presupuesto","type":"select","options":["< $1,000","$1,000-$5,000","$5,000-$15,000","$15,000+","Por definir"],"required":false}
   ]'::jsonb,
   'Cuéntanos sobre tu negocio y qué necesitas. Te respondemos con propuesta detallada en 24-48 horas.', 1),

  ((select id from apps where slug = 'sistema-medida'), 'modulo-crm', 'Módulo CRM',
   'Gestión de clientes, pipeline de ventas y seguimiento de oportunidades.', null, 'quote',
   '[
     {"name":"clientes_actuales","label":"¿Cuántos clientes manejas?","type":"text","required":true},
     {"name":"integraciones","label":"¿Qué necesitas integrar? (WhatsApp, email, etc.)","type":"textarea","required":false}
   ]'::jsonb,
   'Te cotizamos el CRM según tu volumen de clientes y necesidades específicas.', 2),

  ((select id from apps where slug = 'sistema-medida'), 'modulo-pos', 'Módulo POS (Punto de Venta)',
   'Sistema POS para tiendas físicas con caja, inventario y reportes.', null, 'quote',
   '[
     {"name":"tipo_negocio","label":"Tipo de negocio (tienda, restaurante, etc.)","type":"text","required":true},
     {"name":"sucursales","label":"Número de sucursales","type":"number","required":true},
     {"name":"hardware","label":"¿Necesitas hardware (impresora, lector)?","type":"select","options":["Sí","No","No sé"],"required":false}
   ]'::jsonb,
   'Cotizamos según número de sucursales y hardware requerido.', 3),

  ((select id from apps where slug = 'sistema-medida'), 'modulo-inventario', 'Módulo de Inventarios',
   'Control de stock, entradas/salidas, alertas de mínimos y reportes.', null, 'quote',
   '[
     {"name":"productos","label":"¿Cuántos SKUs aprox?","type":"text","required":true},
     {"name":"bodegas","label":"¿Cuántas bodegas/ubicaciones?","type":"number","required":true}
   ]'::jsonb,
   'Cotizamos según volumen de SKUs y complejidad.', 4),

  ((select id from apps where slug = 'sistema-medida'), 'sistema-facturacion', 'Sistema de Facturación FEL',
   'Sistema completo de facturación electrónica integrado con SAT.', null, 'quote',
   '[
     {"name":"volumen","label":"¿Cuántas facturas al mes?","type":"select","options":["< 50","50-200","200-1000","1000+"],"required":true},
     {"name":"clientes_actuales","label":"¿Tienes catálogo de clientes existente?","type":"select","options":["Sí, en Excel","Sí, en otro sistema","No"],"required":false}
   ]'::jsonb,
   'Cotizamos según volumen mensual de facturas.', 5),

  ((select id from apps where slug = 'sistema-medida'), 'otro-sistema', 'Otra solución a medida',
   'Algo único para tu negocio que no está en la lista.', null, 'quote',
   '[
     {"name":"problema","label":"¿Qué problema quieres resolver?","type":"textarea","required":true},
     {"name":"actualmente","label":"¿Cómo lo manejas actualmente?","type":"textarea","required":false}
   ]'::jsonb,
   'Cuéntanos qué necesitas con todo el detalle posible. Te respondemos en 24-48h.', 99);

update apps set
  tagline = 'Sistemas empresariales a tu medida — cotización personalizada',
  title = 'Sistema a la Medida o por Módulos'
where slug = 'sistema-medida';

-- 5. Variantes para ANALÍTICA DE DATOS
delete from app_variants where app_id = (select id from apps where slug = 'analitica-datos');

insert into app_variants (app_id, slug, name, description, price_cents, type, display_order) values
  ((select id from apps where slug = 'analitica-datos'), 'dashboard-basico', 'Dashboard Básico',
   'Dashboard con hasta 5 KPIs principales. Datos de 1 fuente (Excel, Sheets o DB). Ideal para empezar.', 500, 'fixed', 1),
  ((select id from apps where slug = 'analitica-datos'), 'dashboard-intermedio', 'Dashboard Intermedio',
   'Hasta 15 KPIs. Múltiples fuentes de datos. Filtros interactivos por fecha, categoría, etc.', 1000, 'fixed', 2),
  ((select id from apps where slug = 'analitica-datos'), 'dashboard-avanzado', 'Dashboard Avanzado',
   'KPIs ilimitados. Múltiples dashboards por rol. Alertas automáticas. Modelos predictivos básicos.', 2000, 'fixed', 3);

update apps set tagline = 'Dashboards desde $5 — básico, intermedio y avanzado'
where slug = 'analitica-datos';

-- 6. Variantes para SOPORTE TÉCNICO REMOTO
delete from app_variants where app_id = (select id from apps where slug = 'soporte-tecnico-remoto');

insert into app_variants (app_id, slug, name, description, price_cents, type, display_order) values
  ((select id from apps where slug = 'soporte-tecnico-remoto'), 'una-hora', '1 hora de soporte',
   'Soporte remoto por TeamViewer/AnyDesk. Si el problema toma menos, no cobramos extra.', 500, 'fixed', 1),
  ((select id from apps where slug = 'soporte-tecnico-remoto'), 'tres-horas', 'Paquete 3 horas',
   'Tres horas con descuento. Útiles dentro de 30 días.', 1300, 'fixed', 2),
  ((select id from apps where slug = 'soporte-tecnico-remoto'), 'mensual', 'Plan mensual ilimitado',
   'Soporte ilimitado por 30 días. Para empresas con necesidad continua.', 4900, 'fixed', 3);

update apps set tagline = 'Soporte remoto desde $5/hora — por sesión o paquete'
where slug = 'soporte-tecnico-remoto';

-- 7. DESBLOQUEO DE CELULARES → solo cotización con form de IMEI
delete from app_variants where app_id = (select id from apps where slug = 'desbloqueo-celulares');

insert into app_variants (app_id, slug, name, description, price_cents, type, quote_form_fields, quote_instructions, display_order) values
  ((select id from apps where slug = 'desbloqueo-celulares'), 'cotizar', 'Cotizar desbloqueo',
   'Envía los datos de tu celular y te respondemos con el precio exacto por correo en menos de 24 horas.', null, 'quote',
   '[
     {"name":"marca","label":"Marca","type":"text","placeholder":"iPhone, Samsung, Huawei...","required":true},
     {"name":"modelo","label":"Modelo exacto","type":"text","placeholder":"iPhone 14 Pro, Galaxy S23, etc.","required":true},
     {"name":"imei","label":"IMEI (marca *#06# en tu celular)","type":"text","placeholder":"15 dígitos","required":true},
     {"name":"operadora","label":"Operadora actual","type":"text","placeholder":"Tigo, Claro, AT&T, T-Mobile, etc.","required":true},
     {"name":"pais","label":"País de origen del equipo","type":"text","required":true},
     {"name":"motivo","label":"Motivo del desbloqueo","type":"select","options":["Cambio de operadora","Viaje internacional","Compra/venta","Otro"],"required":false}
   ]'::jsonb,
   'Envíanos estos datos. Verificamos compatibilidad y te respondemos con precio exacto. NO cobramos hasta confirmar que se puede desbloquear.', 1);

update apps set tagline = 'Envía IMEI y te respondemos con el precio en 24 horas'
where slug = 'desbloqueo-celulares';

-- 8. PÁGINA WEB - 3 niveles
delete from app_variants where app_id = (select id from apps where slug = 'pagina-web');

insert into app_variants (app_id, slug, name, description, price_cents, type, display_order) values
  ((select id from apps where slug = 'pagina-web'), 'basica', 'Web Básica',
   'Landing page 1 sección. Diseño responsive, formulario de contacto, botón WhatsApp. Entrega en 3-5 días.', 1500, 'fixed', 1),
  ((select id from apps where slug = 'pagina-web'), 'intermedia', 'Web Intermedia',
   'Hasta 5 páginas (Inicio, Nosotros, Servicios, Galería, Contacto). SEO base, blog opcional. Entrega en 7-10 días.', 3000, 'fixed', 2),
  ((select id from apps where slug = 'pagina-web'), 'avanzada', 'Web Avanzada',
   'Tienda en línea, panel administrativo, integración con pagos (Stripe/MercadoPago), múltiples idiomas. Entrega en 14-21 días.', 6000, 'fixed', 3);

update apps set tagline = 'Páginas web desde $15 — básica, intermedia y avanzada'
where slug = 'pagina-web';

-- 9. DESARROLLO DE JUEGOS → Próximamente
delete from app_variants where app_id = (select id from apps where slug = 'desarrollo-juego');

insert into app_variants (app_id, slug, name, description, price_cents, type, display_order) values
  ((select id from apps where slug = 'desarrollo-juego'), 'proximamente', 'Servicios de Desarrollo de Juegos',
   'Próximamente — estamos preparando este servicio. Suscríbete al newsletter para ser notificado cuando esté listo.', null, 'coming_soon', 1);

update apps set tagline = 'Próximamente — videojuegos 2D, 3D, móviles y web'
where slug = 'desarrollo-juego';

-- 10. Verificación
select
  a.title as servicio,
  count(v.id) as variantes,
  min(v.price_cents) filter (where v.type = 'fixed') as desde_centavos,
  string_agg(distinct v.type, ', ') as tipos
from apps a
left join app_variants v on v.app_id = a.id
where a.developer_id = (select id from profiles where email = 'juancadevgt@gmail.com')
  and a.category_id = (select id from categories where slug = 'services')
group by a.id, a.title
order by a.title;
