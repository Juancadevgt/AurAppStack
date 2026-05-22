-- =========================================================
-- Servicio SAT: dejar SOLO los 4 trámites disponibles
-- Borra todas las variantes anteriores y reemplaza por estas 4
-- =========================================================

-- 1. Borrar TODAS las variantes actuales de Servicio SAT
delete from app_variants
where app_id = (select id from apps where slug = 'servicio-sat');

-- 2. Insertar SOLO los 4 trámites disponibles
insert into app_variants (app_id, slug, name, description, price_cents, type, display_order) values
  ((select id from apps where slug = 'servicio-sat'),
   'creacion-nit',
   'Creación de NIT',
   'Trámite completo de inscripción de NIT ante SAT. Incluye orientación sobre régimen fiscal adecuado, presentación de documentos y entrega del NIT activo.',
   1000,
   'fixed',
   1),

  ((select id from apps where slug = 'servicio-sat'),
   'creacion-agencia-virtual',
   'Creación de Agencia Virtual',
   'Configuración y activación de tu cuenta en Agencia Virtual SAT. Incluye usuario, contraseña y guía de uso para que puedas hacer trámites en línea.',
   500,
   'fixed',
   2),

  ((select id from apps where slug = 'servicio-sat'),
   'actualizacion-rtu',
   'Actualización de RTU',
   'Actualización del Registro Tributario Unificado (datos personales, actividad económica, domicilio fiscal). Trámite rápido y seguro.',
   200,
   'fixed',
   3),

  ((select id from apps where slug = 'servicio-sat'),
   'recuperacion-agencia-virtual',
   'Recuperación de Agencia Virtual',
   'Recuperación del acceso a tu Agencia Virtual cuando olvidaste contraseña o tu cuenta fue bloqueada. Restablecemos el acceso de forma segura.',
   800,
   'fixed',
   4);

-- 3. Actualizar la tarjeta principal del servicio
update apps set
  tagline = 'Trámites SAT en Guatemala — NIT, Agencia Virtual, RTU y más',
  description = $$# Servicio SAT — Guatemala

**Trámites SAT sin filas, sin estrés.** Realizamos los principales trámites ante SAT por ti para que te enfoques en tu negocio.

## 🟢 Servicios disponibles

Selecciona el trámite específico que necesitas. Cada uno tiene su precio claro, sin sorpresas.

| Trámite | Precio |
|---|---|
| Creación de NIT | $10 USD |
| Creación de Agencia Virtual | $5 USD |
| Actualización de RTU | $2 USD |
| Recuperación de Agencia Virtual | $8 USD |

## ¿Cómo funciona?

1. **Selecciona el trámite** que necesitas y paga en línea
2. Te contactamos por WhatsApp/correo para pedir los documentos necesarios
3. Realizamos el trámite ante SAT
4. Te entregamos el resultado (NIT, credenciales, comprobante, etc.)

## Tiempos de entrega típicos

- 🆔 **Creación de NIT:** 24-48 horas
- 🔑 **Creación de Agencia Virtual:** 24 horas
- 📝 **Actualización de RTU:** 12-24 horas
- 🔓 **Recuperación de Agencia Virtual:** 24-48 horas

## ¿Por qué con nosotros?

- ✅ **Sin filas ni traslados** — todo se gestiona en línea
- ✅ **Precios fijos** — sin cobros sorpresa
- ✅ **Soporte por WhatsApp** durante todo el trámite
- ✅ **Garantía**: si por algún motivo no podemos hacer el trámite, devolvemos el 100%

---

**¿Necesitas un trámite no listado?** Próximamente agregaremos más opciones. Por ahora estos son los servicios disponibles.$$
where slug = 'servicio-sat';

-- 4. Verificación
select
  v.display_order as orden,
  v.name as tramite,
  '$' || (v.price_cents / 100.0)::text || ' USD' as precio,
  v.type as tipo
from app_variants v
where v.app_id = (select id from apps where slug = 'servicio-sat')
order by v.display_order;
