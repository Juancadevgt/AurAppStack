-- =========================================================
-- Publicar UMDATAX en el marketplace
-- Ejecuta en Supabase SQL Editor
--
-- ⚠️ ANTES DE EJECUTAR: Reemplaza 'juancadevgt@gmail.com'
-- por tu email real en TODAS las apariciones (Ctrl+H en VS Code).
-- =========================================================

-- 1. Asegurar que la cuenta es vendedor
update profiles
set role = 'developer'
where email = 'juancadevgt@gmail.com';

insert into developer_profiles (id)
select id from profiles where email = 'juancadevgt@gmail.com'
on conflict (id) do nothing;

-- 2. Publicar UMDATAX con icono y portada
insert into apps (
  developer_id,
  category_id,
  title,
  slug,
  tagline,
  description,
  icon_url,
  cover_url,
  price_cents,
  currency,
  delivery_type,
  demo_url,
  support_email,
  status,
  published_at,
  tags
) values (
  (select id from profiles where email = 'juancadevgt@gmail.com'),
  (select id from categories where slug = 'tools'),
  'UMDATAX',
  'umdatax',
  'Extrae datos de XML a Excel (FEL, CFDI, DIAN y más) en segundos',
  $$# UMDATAX — Extractor de datos XML a Excel

**Convierte cientos de archivos XML en Excel en segundos.** UMDATAX te permite extraer exactamente los campos que necesitas de archivos XML — uno por uno o cientos a la vez subiendo un ZIP.

## 🎁 ¿Eres usuario registrado?
**Obtén un 10% de descuento** automáticamente al pagar.

## ¿Qué hace?

- 📂 **Lee archivos XML individuales o ZIPs** con cientos de XMLs adentro
- 🎯 **Tú eliges qué campos extraer** del XML (sin programar)
- 📊 **Te devuelve un Excel listo** con todos los datos organizados
- ⚡ **Procesa cientos de archivos en segundos**
- 🌐 **100% web** — no instalas nada

## Casos de uso — Facturación electrónica

- 🇬🇹 **Guatemala — FEL** (Factura Electrónica en Línea)
- 🇲🇽 **México — CFDI** (SAT)
- 🇨🇴 **Colombia — DIAN**
- 🇵🇪 **Perú — Sunat**
- 🇨🇱 **Chile — DTE / SII**
- 🇦🇷 **Argentina — AFIP**
- 🇪🇸 **España — Facturae**

## Otros usos

- ✅ Migración de datos entre sistemas ERP
- ✅ Análisis masivo de facturas para contabilidad
- ✅ Auditorías fiscales
- ✅ Reportes de IVA, retenciones e impuestos
- ✅ Inventarios desde XMLs de productos
- ✅ Compliance y reporting contable
- ✅ Conversión de catálogos XML a Excel

## ¿Por qué UMDATAX?

- 💰 **Pago único.** Sin licencias mensuales, sin renovaciones.
- 🚀 **Sin instalación.** Funciona en tu navegador.
- ♾️ **Sin límites.** Procesa los XMLs que quieras.
- 🤝 **Soporte directo del autor** cuando lo necesites.

## ¿Cómo funciona?

1. Sube tu archivo XML (o un ZIP con varios)
2. Selecciona los campos que quieres extraer
3. Click en **Procesar** → descarga tu Excel
4. Listo. Sin complicaciones.

---

**Ideal para contadores, auditores, administradores y emprendedores que manejan facturación electrónica o cualquier dato en XML.**$$,
  'https://placehold.co/512x512/8b5cf6/ffffff/png?text=UMDATAX&font=montserrat',
  'https://placehold.co/1280x720/f3f0ff/8b5cf6/png?text=UMDATAX&font=montserrat',
  300,                    -- $3.00 USD
  'USD',
  'saas',
  'https://umdatax.vercel.app',
  'juancadevgt@gmail.com',
  'live',
  now(),
  array['xml', 'excel', 'fel', 'cfdi', 'dian', 'sat', 'sunat', 'afip', 'facturacion', 'contabilidad', 'auditoria']
)
on conflict (slug) do update set
  price_cents = excluded.price_cents,
  description = excluded.description,
  tagline = excluded.tagline,
  icon_url = excluded.icon_url,
  cover_url = excluded.cover_url,
  status = 'live',
  published_at = now(),
  tags = excluded.tags;

-- 3. Cupón interno (se aplicará automáticamente cuando el usuario registrado compre)
insert into coupons (
  code,
  app_id,
  discount_pct,
  max_uses,
  expires_at,
  created_by
) values (
  'BIENVENIDO10',
  (select id from apps where slug = 'umdatax'),
  10,
  null,
  null,
  (select id from profiles where email = 'juancadevgt@gmail.com')
)
on conflict (code) do nothing;

-- 4. Verificación final
select
  a.title,
  a.slug,
  '$' || (a.price_cents / 100.0)::text as precio_publico,
  c.name as categoria,
  a.status,
  a.icon_url is not null as tiene_icono,
  a.cover_url is not null as tiene_portada,
  p.email as vendedor
from apps a
left join categories c on c.id = a.category_id
left join profiles p on p.id = a.developer_id
where a.slug = 'umdatax';
