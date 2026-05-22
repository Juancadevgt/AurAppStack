-- =========================================================
-- Añadir categoría "Servicios" + publicar los 8 servicios
--
-- ⚠️ ANTES DE EJECUTAR: Reemplaza 'juancadevgt@gmail.com'
-- por tu email real (Ctrl+H en VS Code).
-- =========================================================

-- 1. Añadir la categoría "Servicios" (si no existe)
insert into categories (slug, name, icon, display_order) values
  ('services', 'Servicios', 'Briefcase', 7)
on conflict (slug) do update
  set name = excluded.name,
      icon = excluded.icon,
      display_order = excluded.display_order;

-- Mover "Otros" al final
update categories set display_order = 8 where slug = 'other';

-- 2. Asegurar que la cuenta es vendedor
update profiles
set role = 'developer'
where email = 'juancadevgt@gmail.com';

insert into developer_profiles (id)
select id from profiles where email = 'juancadevgt@gmail.com'
on conflict (id) do nothing;

-- 3. Publicar los 8 servicios
insert into apps (
  developer_id, category_id, title, slug, tagline, description,
  icon_url, cover_url, price_cents, currency, delivery_type,
  support_email, status, published_at, tags
) values
-- ===== 1. SERVICIO SAT =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Servicio SAT',
  'servicio-sat',
  'Trámites, facturación electrónica FEL y declaraciones ante SAT',
  $$# Servicio SAT — Tu aliado fiscal

**Olvídate de los dolores de cabeza con el SAT.** Manejamos todos tus trámites fiscales para que tú te enfoques en vender.

## ¿Qué incluye?

- 📋 Inscripción y altas en el SAT
- 🧾 Facturación electrónica FEL (Guatemala) / CFDI (México)
- 📊 Declaraciones mensuales y anuales
- 📑 Contabilidad básica
- 🔐 Acceso a Agencia Virtual y firmas electrónicas
- 💬 Asesoría continua por WhatsApp

## ¿Para quién?

Pequeños negocios, freelancers y emprendedores que necesitan estar al día con el SAT sin complicarse la vida.

## Tarifa publicada: consultoría inicial

El precio mostrado es la **consultoría inicial de diagnóstico** (1 hora). Después de revisar tu caso, te enviamos cotización personalizada según el volumen.$$,
  'https://placehold.co/512x512/059669/ffffff/png?text=SAT',
  'https://placehold.co/1280x720/d1fae5/059669/png?text=Servicio+SAT',
  4900, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['sat', 'fel', 'cfdi', 'facturacion', 'contabilidad', 'impuestos', 'fiscal']
),
-- ===== 2. DESARROLLO DE SOFTWARE =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Desarrollo de Software',
  'desarrollo-software',
  'Construimos apps, webs y sistemas a la medida de tu negocio',
  $$# Desarrollo de Software a la Medida

**Convertimos tus ideas en software que funciona.** Web, móvil o desktop — escogemos la tecnología correcta para tu proyecto.

## Stack que dominamos

- ⚛️ **Web:** React, Next.js, Node.js
- 📱 **Móvil:** React Native, Flutter
- 🐘 **Bases de datos:** PostgreSQL, MongoDB, MySQL
- ☁️ **Cloud:** AWS, Vercel, Supabase, Google Cloud

## Tipo de proyectos

- 🌐 Aplicaciones web (SaaS, plataformas, dashboards)
- 📱 Apps móviles nativas y multiplataforma
- 🤖 Bots de WhatsApp, Telegram, Discord
- 🔗 Integraciones de APIs (Stripe, PayPal, MercadoPago, etc.)
- 📊 Sistemas de gestión (CRM, inventario, RRHH)

## ¿Cómo trabajamos?

1. **Consultoría inicial** ($99) — entendemos tu necesidad
2. **Cotización detallada** — alcance, tiempos y costo total
3. **Desarrollo ágil** — entregas semanales
4. **Soporte post-lanzamiento** — 30 días gratis

## Precio mostrado

Es la **consultoría inicial de 1 hora**. Salimos con un documento de alcance y cotización del proyecto completo.$$,
  'https://placehold.co/512x512/3b82f6/ffffff/png?text=DEV',
  'https://placehold.co/1280x720/dbeafe/3b82f6/png?text=Desarrollo+de+Software',
  9900, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['desarrollo', 'software', 'web', 'mobile', 'app', 'sistema', 'react', 'nextjs']
),
-- ===== 3. ANALÍTICA DE DATOS =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Analítica de Datos',
  'analitica-datos',
  'Dashboards y reportes para entender tus números y vender más',
  $$# Servicios de Analítica de Datos

**Tus datos son tu mina de oro.** Te ayudamos a extraer insights, construir dashboards y tomar decisiones basadas en datos reales.

## ¿Qué incluye?

- 📊 **Dashboards interactivos** (Power BI, Looker Studio, Metabase)
- 📈 **KPIs por rol** (gerencia, ventas, operaciones)
- 🔍 **Análisis exploratorio** de tus datos actuales
- 🧪 **A/B testing** y experimentos
- 🤖 **Modelos predictivos** (ML básico) si aplica
- 📑 **Reportes automatizados** por email

## ¿Para quién?

- Negocios con datos dispersos en Excel/sistemas que no se hablan
- Empresas que quieren empezar a usar BI sin contratar un equipo interno
- Equipos comerciales que necesitan ver sus métricas claras

## Stack típico

Excel/Sheets → BigQuery / Supabase → Looker Studio / Metabase. Sin necesidad de licencias caras.

## Precio mostrado

Es el **reporte inicial básico**: hasta 5 KPIs claves de tu negocio en un dashboard navegable. Proyectos más grandes se cotizan aparte.$$,
  'https://placehold.co/512x512/eab308/ffffff/png?text=📊',
  'https://placehold.co/1280x720/fef3c7/eab308/png?text=Analitica+de+Datos',
  14900, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['analitica', 'datos', 'dashboard', 'bi', 'kpi', 'powerbi', 'metabase']
),
-- ===== 4. SOPORTE TÉCNICO REMOTO =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Soporte Técnico Remoto',
  'soporte-tecnico-remoto',
  'Solucionamos tus problemas de PC y red desde donde estés',
  $$# Soporte Técnico Remoto

**Tu computadora con problemas y nosotros la arreglamos sin movernos de la silla.** Soporte por TeamViewer, AnyDesk o RustDesk en menos de 30 minutos.

## ¿Qué solucionamos?

- 🦠 Virus, malware y ransomware
- 🐌 Computadora lenta (limpieza + optimización)
- 🔧 Instalación de programas y configuración
- 🌐 Problemas de red, WiFi e impresoras
- 💾 Recuperación de archivos
- 📧 Configuración de correos y Office
- 🖥️ Asesoría general de software

## ¿Cómo funciona?

1. Pagas la sesión
2. Te enviamos por WhatsApp el link de conexión
3. Aceptas la conexión remota
4. Resolvemos en vivo
5. Te dejamos guía para que no se repita

## Horario de atención

L-V 8am-7pm · Sábados 9am-2pm (GMT-6). Casos urgentes fuera de horario: contacta antes de pagar.

## Precio mostrado

Es **1 hora de soporte**. Si el problema toma menos, descontamos los minutos. Si toma más, te avisamos antes de continuar.$$,
  'https://placehold.co/512x512/06b6d4/ffffff/png?text=🎧',
  'https://placehold.co/1280x720/cffafe/06b6d4/png?text=Soporte+Remoto',
  2900, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['soporte', 'pc', 'computadora', 'remoto', 'virus', 'anydesk', 'teamviewer']
),
-- ===== 5. DESBLOQUEO DE CELULARES =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Desbloqueo de Celulares',
  'desbloqueo-celulares',
  'Liberamos tu celular de la operadora — Android e iOS',
  $$# Desbloqueo de Celulares

**¿Tu celular está atado a una operadora?** Lo liberamos para que uses cualquier SIM del mundo.

## ¿Qué desbloqueamos?

- 📱 **iPhone** (desbloqueo permanente vía IMEI)
- 🤖 **Android** (Samsung, Huawei, Xiaomi, Motorola, LG y más)
- 🌍 Operadoras de USA, México, España, Centroamérica
- 🔓 Desbloqueo de cuenta Google (FRP)
- 🆔 Desbloqueo de iCloud (casos legales)

## ¿Cómo funciona?

1. Nos das marca, modelo e IMEI (marca `*#06#` en tu celular)
2. Verificamos compatibilidad antes de cobrar
3. Pagas el servicio
4. Recibes instrucciones en 1-48 horas según el modelo
5. Garantía: si no funciona, devolvemos tu dinero

## Garantías

- ✅ Desbloqueo **permanente** (no temporal)
- ✅ No daña tu equipo
- ✅ Mantiene la garantía oficial
- ✅ Reembolso 100% si no es compatible

## Precio mostrado

Es para **modelos comunes**. iPhones nuevos o modelos exóticos pueden tener precio diferente — consulta antes.$$,
  'https://placehold.co/512x512/ec4899/ffffff/png?text=📱',
  'https://placehold.co/1280x720/fce7f3/ec4899/png?text=Desbloqueo+Celulares',
  1999, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['desbloqueo', 'celular', 'iphone', 'android', 'imei', 'unlock', 'liberar']
),
-- ===== 6. PÁGINA WEB =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Página Web Profesional',
  'pagina-web',
  'Páginas web modernas, rápidas y optimizadas para conversión',
  $$# Página Web Profesional

**Tu negocio necesita una web que venda, no solo que se vea bonita.** Diseñamos páginas optimizadas para captar clientes.

## ¿Qué incluye?

- 🎨 **Diseño moderno** y responsive (mobile + desktop)
- ⚡ **Carga ultra rápida** (puntuación 90+ en Google PageSpeed)
- 🔍 **SEO base** para que Google te encuentre
- 📝 **Formulario de contacto** que llega a tu correo o WhatsApp
- 📊 **Google Analytics** instalado
- 🌐 **Dominio + hosting** primer año gratis (.com)
- 📧 **3 correos profesionales** (tu@tunegocio.com)
- 📱 **Botón flotante de WhatsApp**

## Tipos de web

| Plan | Páginas | Para quién |
|---|---|---|
| **Landing** | 1 página | Producto único, evento, captación |
| **Catálogo** | 5 páginas | Negocios con servicios o productos |
| **Tienda en línea** | Catálogo + carrito | E-commerce con pagos en línea |
| **Web a la medida** | Lo que necesites | Casos especiales |

## Tiempos

- Landing: 5-7 días hábiles
- Catálogo: 10-14 días
- Tienda: 14-21 días

## Precio mostrado

Es la **landing de 1 página**. Otros planes se cotizan aparte. Incluye 2 rondas de cambios.$$,
  'https://placehold.co/512x512/8b5cf6/ffffff/png?text=WEB',
  'https://placehold.co/1280x720/ede9fe/8b5cf6/png?text=Pagina+Web',
  29900, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['web', 'pagina', 'landing', 'sitio', 'wordpress', 'nextjs', 'seo']
),
-- ===== 7. SISTEMA A LA MEDIDA =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Sistema a la Medida o por Módulos',
  'sistema-medida',
  'ERPs, CRMs y sistemas empresariales adaptados a tu negocio',
  $$# Sistema a la Medida

**Cada negocio es único. Tu sistema también debería serlo.** Construimos software empresarial completo o por módulos según lo necesites.

## Módulos disponibles

- 👥 **CRM** — gestión de clientes y pipeline de ventas
- 📦 **Inventarios** — entradas, salidas, alertas de stock
- 💳 **Punto de venta (POS)** — para tiendas físicas
- 🧾 **Facturación electrónica** — integrado con SAT/DIAN/FEL
- 💰 **Contabilidad** — pólizas, balances, estados financieros
- 🚚 **Logística** — rutas, pedidos, repartidores
- 👤 **RRHH** — empleados, nómina, vacaciones
- 📊 **BI/Reportes** — dashboards ejecutivos
- 🌐 **Portal cliente** — para que tus clientes consulten su info

## Modalidades

### Por módulos (modular)
Empiezas con 1-2 módulos y vas creciendo. Pagas solo lo que usas.

### A la medida (custom completo)
Desarrollamos exactamente lo que tu negocio necesita. Ideal para negocios con procesos únicos.

## Tecnologías

Web (Next.js + PostgreSQL), responsive en móvil, integración con APIs (Stripe, MercadoPago, FEL, CFDI, WhatsApp).

## Precio mostrado

Es la **consultoría inicial de descubrimiento** (sesión 2 horas + documento de alcance + cotización detallada). Proyecto completo se cotiza después.$$,
  'https://placehold.co/512x512/dc2626/ffffff/png?text=ERP',
  'https://placehold.co/1280x720/fee2e2/dc2626/png?text=Sistema+a+la+Medida',
  19900, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['erp', 'crm', 'sistema', 'medida', 'modular', 'empresarial', 'inventario', 'pos']
),
-- ===== 8. DESARROLLO DE VIDEOJUEGOS =====
(
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'services'),
  'Desarrollo de Videojuegos',
  'desarrollo-juego',
  'Juegos 2D, 3D, móviles y web — desde idea hasta tienda',
  $$# Desarrollo de Videojuegos

**¿Tienes una idea de juego en la cabeza?** La convertimos en un juego jugable, publicado y monetizable.

## Plataformas

- 📱 **Móvil** — Android (Play Store) e iOS (App Store)
- 🌐 **Web** — HTML5 / WebGL para jugar en el navegador
- 🖥️ **PC/Mac** — Steam, itch.io
- 🎮 **Consolas** — Switch, Xbox (proyectos avanzados)

## Estilos que dominamos

- 🎯 **Hyper-casual** (estilo Voodoo, Ketchapp)
- 🧩 **Puzzle** (estilo Candy Crush, Match-3)
- 🏃 **Endless runner / arcade**
- 🃏 **Cartas / casino**
- 🎲 **Board games digitalizados**
- 📖 **Visual novels** y narrativos
- 🏰 **2D plataformas / metroidvania**

## Stack

- 🎮 **Motores:** Unity, Godot, Phaser (web)
- 🎨 **Arte:** 2D propio o stock, 3D según el proyecto
- 🎵 **Audio:** música original o royalty-free curado
- 💰 **Monetización:** ads, IAP, premium

## Proceso

1. **Sesión creativa** (incluida en el precio): definimos game design
2. **Prototipo** jugable en 2-3 semanas
3. **Producción** con sprints quincenales
4. **Publicación** en las tiendas (a tu nombre)
5. **Soporte post-lanzamiento** 30 días

## Precio mostrado

Es la **consultoría creativa inicial** (sesión 2-3 horas + documento de game design + cotización detallada del juego completo).$$,
  'https://placehold.co/512x512/f97316/ffffff/png?text=🎮',
  'https://placehold.co/1280x720/ffedd5/f97316/png?text=Desarrollo+de+Juegos',
  29900, 'USD', 'service', 'juancadevgt@gmail.com', 'live', now(),
  array['juego', 'videojuego', 'game', 'unity', 'godot', 'mobile', 'ios', 'android']
)
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  icon_url = excluded.icon_url,
  cover_url = excluded.cover_url,
  price_cents = excluded.price_cents,
  status = 'live',
  published_at = now(),
  tags = excluded.tags;

-- 4. Verificación
select
  c.name as categoria,
  a.title,
  a.slug,
  '$' || (a.price_cents / 100.0)::text as precio,
  a.status
from apps a
join categories c on c.id = a.category_id
where c.slug = 'services'
order by a.title;
