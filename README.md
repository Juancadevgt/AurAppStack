# 🚀 AurAppStack

Marketplace de aplicaciones (bots de WhatsApp, POS, automatizaciones, agentes IA, etc.) donde desarrolladores publican apps y reciben pagos automáticos, y compradores acceden con soporte directo del autor.

**Stack:** Next.js 15 (App Router) + Supabase (Postgres + Auth + Storage) + Stripe Connect + Resend + Vercel

---

## 📋 Características

- ✅ Catálogo de apps con búsqueda, filtros y categorías (SEO-friendly con ISR)
- ✅ Autenticación email/password (Supabase Auth)
- ✅ Panel **desarrollador**: publicar apps, ver ventas, conectar Stripe
- ✅ Panel **comprador**: mis compras, soporte
- ✅ Panel **admin**: aprobar/rechazar apps, gestionar usuarios
- ✅ Pagos con Stripe Connect (comisión automática configurable)
- ✅ Webhooks de Stripe para procesar compras y refunds
- ✅ Newsletter con notificación automática de nuevas apps
- ✅ Emails transaccionales con Resend
- ✅ Reviews y ratings
- ✅ Tickets de soporte comprador → desarrollador
- ✅ Row Level Security en todas las tablas

---

## 🛠️ Setup local

### 1. Instalar dependencias

```powershell
cd C:\AurAppStack
npm install --legacy-peer-deps
```

### 2. Crear proyecto Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) y crea cuenta
2. **New Project** → nómbralo `aurappstack`
3. Espera ~2 min a que se aprovisione
4. En **SQL Editor**, ejecuta los archivos en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
5. Ve a **Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreto)

### 3. Crear cuenta Stripe (modo test)

1. Ve a [stripe.com](https://stripe.com) y crea cuenta
2. Activa **modo test** (toggle arriba a la derecha)
3. Ve a **Developers → API keys**:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
4. **Habilitar Connect**: Stripe Dashboard → Settings → Connect → **Enable**
5. Ve a [Connect settings](https://dashboard.stripe.com/test/settings/connect) → elige **Platform or Marketplace**

### 4. Configurar webhook Stripe (local)

Instala Stripe CLI:
```powershell
# Descarga desde https://github.com/stripe/stripe-cli/releases (Windows)
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copia el `whsec_...` que sale → `STRIPE_WEBHOOK_SECRET`

### 5. Crear cuenta Resend (gratis - 3000 emails/mes)

1. [resend.com](https://resend.com) → crear cuenta
2. **API Keys** → crear key → `RESEND_API_KEY`
3. Por ahora usa `onboarding@resend.dev` como `RESEND_FROM_EMAIL`
   (después verifica tu dominio para usar `noreply@tudominio.com`)

### 6. Variables de entorno

Copia `.env.example` a `.env.local` y llena los valores:

```bash
cp .env.example .env.local
```

### 7. Levantar dev server

```powershell
npm run dev
```

→ Abre [http://localhost:3000](http://localhost:3000)

### 8. Crear tu usuario admin

1. Regístrate en `/register` con tu correo
2. En Supabase **SQL Editor**, ejecuta:
   ```sql
   select promote_to_admin('tu@email.com');
   ```
3. Cierra sesión y vuelve a entrar → verás panel `/admin`

---

## 🌐 Despliegue a producción (Vercel + dominios)

### Paso 1: Subir código a GitHub

```powershell
git init
git add .
git commit -m "Initial commit: AurAppStack marketplace"

# Crea repo en github.com (nuevo, vacío, sin README)
git remote add origin https://github.com/tu-usuario/aurappstack.git
git branch -M main
git push -u origin main
```

### Paso 2: Crear proyecto Supabase de producción

> ⚠️ Recomendado: usa un proyecto Supabase **diferente** para producción que para dev.
> Free tier permite 2 proyectos.

Repite el setup de Supabase (paso 2 arriba) y ejecuta las migraciones SQL.

### Paso 3: Stripe modo **live**

1. En Stripe, desactiva modo test (cambia a **Live**)
2. Activa Connect en modo live
3. Crea API keys de live: `sk_live_...`, `pk_live_...`

### Paso 4: Deploy en Vercel

1. [vercel.com](https://vercel.com) → **Sign up con GitHub**
2. **Add New → Project** → selecciona tu repo `aurappstack`
3. **Framework Preset**: Next.js (auto-detectado)
4. **Environment Variables** → añade todas tus vars de `.env.local` pero con valores de producción:
   - `NEXT_PUBLIC_APP_URL` = `https://tu-dominio.com`
   - `NEXT_PUBLIC_SUPABASE_URL` = URL del proyecto prod
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon prod
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role prod
   - `STRIPE_SECRET_KEY` = sk_live_...
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_live_...
   - `STRIPE_WEBHOOK_SECRET` = (se llena en paso 5)
   - `MARKETPLACE_COMMISSION_PCT` = 20
   - `RESEND_API_KEY` = re_...
   - `RESEND_FROM_EMAIL` = noreply@tudominio.com
   - `ADMIN_EMAIL` = tu@dominio.com
5. **Deploy** → espera 2-3 min

### Paso 5: Conectar webhook Stripe a producción

1. En Stripe Dashboard (live) → **Developers → Webhooks → Add endpoint**
2. URL: `https://tu-dominio.com/api/webhooks/stripe`
3. Eventos a escuchar:
   - `checkout.session.completed`
   - `account.updated`
   - `charge.refunded`
4. Copia el `Signing secret` → en Vercel → Settings → Environment Variables → edita `STRIPE_WEBHOOK_SECRET`
5. Redeploy

### Paso 6: Custom domain

1. En Vercel → tu proyecto → **Settings → Domains**
2. Añade `tudominio.com`
3. Configura el DNS en tu proveedor (Cloudflare/Namecheap/etc.):
   - `A` record a `76.76.21.21`
   - O `CNAME` `www` a `cname.vercel-dns.com`
4. Espera propagación (1-60 min)

### Paso 7: Verificar dominio en Resend

1. [resend.com](https://resend.com) → Domains → Add Domain → `tudominio.com`
2. Añade los DNS records que te muestre (SPF, DKIM, DMARC)
3. Cuando esté **verified**, actualiza `RESEND_FROM_EMAIL=noreply@tudominio.com`

### Paso 8: Promover a admin en producción

En Supabase prod → SQL Editor:
```sql
select promote_to_admin('tu@tudominio.com');
```

---

## 📈 Escalabilidad

| Etapa | Usuarios | Costo aprox | Cambios necesarios |
|---|---|---|---|
| **MVP** | 0-10K | $0 | Free tier de todo |
| **Crecimiento** | 10K-100K | $25/mes | Supabase Pro |
| **Escala** | 100K-1M | $100-300/mes | Supabase Pro + Read replicas + Upstash Redis |
| **Masivo** | 1M+ | $500+/mes | Migrar pagos a workers, dedicated DB |

**Optimizaciones ya incluidas:**
- ✅ Server Components (menos JS al cliente)
- ✅ ISR en páginas de apps (cacheado, revalida cada 5 min)
- ✅ Edge middleware (auth sin cold start)
- ✅ Índices DB en columnas clave (status, category_id, etc.)
- ✅ Full-text search PostgreSQL en columna `apps`
- ✅ Row Level Security (seguridad a nivel de DB)

---

## 🧪 Probar la compra (modo test)

Usa estas tarjetas de prueba en Stripe checkout:
- ✅ Éxito: `4242 4242 4242 4242` · cualquier fecha futura · cualquier CVC
- ❌ Fallida: `4000 0000 0000 0002`
- 🔐 3D Secure: `4000 0025 0000 3155`

---

## 🐛 Troubleshooting

**Error: "Cannot read properties of null (reading 'getUser')"**
→ Revisa que `NEXT_PUBLIC_SUPABASE_URL` y `ANON_KEY` estén bien.

**Webhooks no llegan en local**
→ Asegúrate que `stripe listen --forward-to localhost:3000/api/webhooks/stripe` esté corriendo.

**RLS bloquea queries**
→ En desarrollo puedes ver logs en Supabase Dashboard → Database → Logs.

**Build falla en Vercel**
→ Asegúrate que `npm install --legacy-peer-deps` funcione localmente. Configura en Vercel:
   `Settings → General → Install Command` = `npm install --legacy-peer-deps`

---

## 📂 Estructura

```
src/
├── app/
│   ├── (auth)/              ← login, register
│   ├── (marketplace)/       ← home, /apps, /apps/[slug], /category/[name]
│   ├── dashboard/           ← panel comprador
│   ├── developer/           ← panel desarrollador
│   ├── admin/               ← panel admin
│   ├── api/
│   │   ├── checkout/        ← crear sesión Stripe
│   │   ├── webhooks/stripe/ ← procesar pagos
│   │   ├── stripe/connect/  ← onboarding devs
│   │   ├── newsletter/      ← suscripciones
│   │   └── notify/new-app/  ← email masivo a suscriptores
│   └── auth/                ← callbacks de Supabase Auth
├── components/
│   ├── ui/                  ← shadcn/ui (Button, Card, Input...)
│   ├── shared/              ← Header, Footer, DashboardNav
│   └── marketplace/         ← AppCard, NewsletterSignup
├── lib/
│   ├── supabase/            ← clientes browser/server/service
│   ├── stripe.ts            ← cliente Stripe + comisión
│   ├── email/               ← Resend
│   ├── constants.ts
│   └── utils.ts             ← cn, formatPrice, slugify
├── types/
│   └── database.ts          ← tipos Postgres
└── middleware.ts            ← auth + role check

supabase/
└── migrations/
    ├── 001_initial_schema.sql
    └── 002_functions.sql
```

---

## 📝 Próximos pasos (roadmap)

- [ ] Upload directo de imágenes a Supabase Storage (drag & drop)
- [ ] Búsqueda con tipos avanzados (precio, rating, fecha)
- [ ] Chat en tiempo real soporte (Supabase Realtime)
- [ ] Cupones y descuentos en checkout
- [ ] Pagos recurrentes (suscripciones de apps SaaS)
- [ ] Multi-idioma (i18n)
- [ ] App móvil con Expo compartiendo APIs

---

## 📄 Licencia

Privado. Todos los derechos reservados.
