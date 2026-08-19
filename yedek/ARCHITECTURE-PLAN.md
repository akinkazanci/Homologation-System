# Kurumsal Proje Mimarisi Düzenlemesi Planı

## 1. ENTERPRİSE-GRADE MİMARİ ÖNERİSİ

Mevcut projede **separation of concerns** (sorumlulukların ayrılması) ilkesi eksik ve dosyalar dağınık. Aşağıda Next.js 16 + TypeScript + React için kurumsal standart bir mimari yapı önerilmektedir.

### Temel Prensipler:
- **Layered Architecture**: UI → Services → Business Logic → Data Access
- **Feature-Based Organization**: Fonksiyonellikler kendi klasörlerinde
- **Single Responsibility**: Dosyalar tek bir sorumluluğu yerine getirsin
- **Type Safety**: TypeScript ile full type coverage
- **Reusability**: Shared utilities, hooks, components
- **Testability**: Birimler kolayca test edilebilir

### Katmanlar:
1. **Presentation Layer** (`/ui`, `/pages`, `/components`) - UI bileşenleri
2. **Application Layer** (`/store`, `/hooks`, `/contexts`) - State yönetimi
3. **Business Logic Layer** (`/services`, `/utils`) - İşletme kuralları
4. **Data Access Layer** (`/server`, `/actions`) - API, veritabanı
5. **Domain Layer** (`/types`, `/constants`) - Veri modelleri, sabitler

---

## 2. İSİMLENDİRME STANDARTLARI (SOMUT KURALLAR)

### 📁 Klasör Adlandırması
- **Format**: `kebab-case` (küçük harfler, tireleme)
- **Örnekler**:
  - ✅ `/product-management`, `/certificate-upload`, `/admin-dashboard`
  - ❌ `/ProductManagement`, `/certificateUpload`, `/AdminDashboard`

### 📄 Dosya Adlandırması

#### Bileşenler (React Components)
- **Format**: `PascalCase` (büyük harf başlangıç)
- **Konum**: `/components/{feature}/`, adı = klasörle aynı
- **Örnekler**:
  ```
  components/certificate-panel/CertificatePanel.tsx
  components/admin-dashboard/AdminDashboard.tsx
  components/homologation-browser/HomologationBrowser.tsx
  components/ui/Button.tsx
  ```

#### Sayfalar (Page Components)
- **Format**: `page.tsx` (Next.js convention)
- **Konum**: `/app/{route}/page.tsx`
- **Örnekler**:
  ```
  app/page.tsx
  app/admin/page.tsx
  app/company/page.tsx
  ```

#### API Routes
- **Format**: `route.ts` (Next.js convention)
- **Konum**: `/app/api/{endpoint}/route.ts`
- **Örnekler**:
  ```
  app/api/products/route.ts
  app/api/certificates/upload/route.ts
  app/api/company/upload/route.ts
  ```

#### Server Actions
- **Format**: `camelCase` + `.actions.ts` veya `Actions.ts` suffix
- **Konum**: `/lib/server/{feature}.actions.ts` veya `/app/{feature}/(actions)/actions.ts`
- **Örnekler**:
  ```
  lib/server/certificate.actions.ts
  lib/server/product.actions.ts
  lib/server/company.actions.ts
  ```

#### Client Actions
- **Format**: `camelCase` + `.actions.ts`
- **Konum**: `/lib/client/{feature}.actions.ts`
- **Örnekler**:
  ```
  lib/client/certificate.actions.ts
  ```

#### Hooks (React Hooks)
- **Format**: `camelCase` + `use` prefix
- **Dosya adı**: `use{PascalCase}.ts` (example: `useCertificates.ts`)
- **Konum**: `/lib/hooks/` veya `/features/{feature}/hooks/`
- **Örnekler**:
  ```
  lib/hooks/useCertificates.ts
  lib/hooks/useProducts.ts
  lib/hooks/useUploadProgress.ts
  ```

#### Context & Providers
- **Format**: `{Feature}Context.ts` veya `{Feature}Provider.tsx`
- **Konum**: `/lib/contexts/` veya `/features/{feature}/contexts/`
- **Örnekler**:
  ```
  lib/contexts/CertificatesContext.ts
  lib/contexts/ProductsContext.ts
  ```

#### Types & Interfaces
- **Format**: `{Domain}.types.ts`
- **Konum**: `/lib/types/` veya `/features/{feature}/types/`
- **İçerik**: Interface ve Type definitions
- **Örnekler**:
  ```
  lib/types/certificate.types.ts
  lib/types/product.types.ts
  lib/types/company.types.ts
  lib/types/index.ts (re-exports)
  ```

#### Constants
- **Format**: `{Domain}.constants.ts`
- **Konum**: `/lib/constants/` veya `/features/{feature}/constants/`
- **Örnekler**:
  ```
  lib/constants/certificate.constants.ts
  lib/constants/upload.constants.ts
  ```

#### Utilities
- **Format**: `camelCase` + `.ts`
- **Konum**: `/lib/utils/`
- **Örnekler**:
  ```
  lib/utils/fileHelpers.ts
  lib/utils/dateFormatters.ts
  lib/utils/hashUtils.ts
  ```

#### Styles
- **Format**: `{Component}.module.css` veya `{Feature}.css`
- **Konum**: `/styles/` veya `/components/{feature}/` içinde
- **Örnekler**:
  ```
  components/certificate-panel/CertificatePanel.module.css
  styles/globals.css
  ```

#### Tests
- **Format**: `{Module}.test.ts` veya `{Module}.spec.ts`
- **Konum**: Test dosyası yanına veya `/tests/{path-mirror}/`
- **Örnekler**:
  ```
  lib/utils/fileHelpers.test.ts
  components/certificate-panel/CertificatePanel.test.tsx
  tests/api/certificates/upload.test.ts
  ```

---

## 3. ÖNERİLEN YENİ KLASÖR AĞACI (MARKDOWN)

```
homologasyon-yoenetim-sistemi/
│
├─ 📁 app/                                    # Next.js App Router
│  ├─ layout.tsx                              # Root layout
│  ├─ page.tsx                                # Home page (/)
│  ├─ 📁 (auth)/                              # Auth routes (future)
│  ├─ 📁 admin/
│  │  └─ page.tsx
│  ├─ 📁 api/
│  │  ├─ 📁 products/
│  │  │  └─ route.ts
│  │  ├─ 📁 certificates/
│  │  │  ├─ route.ts                          # GET/POST certificates
│  │  │  └─ 📁 upload/
│  │  │     └─ route.ts                       # POST upload
│  │  └─ 📁 company/
│  │     └─ 📁 upload/
│  │        └─ route.ts                       # POST company upload
│  ├─ 📁 certificates/
│  │  └─ 📁 [code]/
│  │     └─ 📁 [certId]/
│  │        └─ page.tsx
│  └─ 📁 company/
│     └─ page.tsx
│
├─ 📁 components/                             # Reusable React Components
│  ├─ 📁 ui/                                  # Base UI components
│  │  ├─ Button.tsx
│  │  ├─ Card.tsx
│  │  ├─ Dialog.tsx
│  │  └─ ...
│  ├─ 📁 certificate-panel/                   # Feature: Certificate Display
│  │  ├─ CertificatePanel.tsx
│  │  ├─ CertificateItem.tsx
│  │  ├─ CertificateFilter.tsx
│  │  └─ CertificatePanel.module.css
│  ├─ 📁 product-browser/                     # Feature: Product Browsing
│  │  ├─ ProductBrowser.tsx                  (prev: HomologationBrowser)
│  │  ├─ ProductList.tsx
│  │  ├─ ProductCard.tsx
│  │  └─ ProductBrowser.module.css
│  ├─ 📁 company-certificates/                # Feature: Company Certs
│  │  ├─ CompanyCertificates.tsx
│  │  ├─ CompanyCertificateCard.tsx
│  │  └─ CompanyCertificates.module.css
│  ├─ 📁 admin-dashboard/                     # Feature: Admin Panel
│  │  ├─ AdminDashboard.tsx
│  │  ├─ ProductForm.tsx
│  │  ├─ CertificateForm.tsx
│  │  ├─ UploadManager.tsx
│  │  └─ AdminDashboard.module.css
│  ├─ 📁 site-header/
│  │  └─ SiteHeader.tsx
│  ├─ 📁 site-footer/
│  │  └─ SiteFooter.tsx
│  └─ 📁 hero-banner/
│     └─ HeroBanner.tsx
│
├─ 📁 lib/                                    # Business Logic & Utilities
│  ├─ 📁 types/                               # Type Definitions
│  │  ├─ certificate.types.ts
│  │  ├─ product.types.ts
│  │  ├─ company.types.ts
│  │  └─ index.ts                             # Re-exports
│  │
│  ├─ 📁 constants/                           # Constants & Config
│  │  ├─ certificate.constants.ts
│  │  ├─ product.constants.ts
│  │  ├─ upload.constants.ts
│  │  └─ index.ts
│  │
│  ├─ 📁 hooks/                               # React Hooks
│  │  ├─ useCertificates.ts
│  │  ├─ useProducts.ts
│  │  ├─ useUploadProgress.ts
│  │  └─ index.ts
│  │
│  ├─ 📁 contexts/                            # Context & Providers
│  │  ├─ CertificatesContext.tsx
│  │  ├─ ProductsContext.tsx
│  │  └─ index.ts
│  │
│  ├─ 📁 server/                              # Server-side Actions & Logic
│  │  ├─ certificate.actions.ts
│  │  ├─ product.actions.ts
│  │  ├─ company.actions.ts
│  │  └─ index.ts
│  │
│  ├─ 📁 client/                              # Client-side Actions
│  │  ├─ certificate.actions.ts
│  │  └─ index.ts
│  │
│  ├─ 📁 utils/                               # Utility Functions
│  │  ├─ fileHelpers.ts                       # File operations
│  │  ├─ hashUtils.ts                         # Hash/crypto
│  │  ├─ dateFormatters.ts                    # Date formatting
│  │  ├─ downloadHelpers.ts
│  │  ├─ validators.ts                        # Input validation
│  │  └─ index.ts
│  │
│  └─ utils.ts                                # General utilities (shadcn)
│
├─ 📁 styles/                                 # Global Styles
│  ├─ globals.css
│  ├─ variables.css                           # CSS variables
│  └─ 📁 themes/                              # Theme files
│
├─ 📁 public/                                 # Static Assets
│  ├─ 📁 images/
│  │  ├─ 📁 logos/
│  │  ├─ 📁 icons/
│  │  └─ 📁 brands/
│  ├─ 📁 uploads/                             # Uploaded certificates (runtime)
│  ├─ 📁 fonts/
│  └─ favicon.ico
│
├─ 📁 data/                                   # Data & Seed Data
│  ├─ products.json                           # Product seed data
│  ├─ company-certificates.json               # Company cert metadata
│  └─ 📁 seeds/                               # (future) More seed data
│
├─ 📁 tests/                                  # Test Files
│  ├─ 📁 unit/
│  │  ├─ 📁 utils/
│  │  ├─ 📁 hooks/
│  │  └─ ...
│  ├─ 📁 integration/
│  │  └─ 📁 api/
│  └─ 📁 e2e/
│
├─ 📁 .github/                                # GitHub Actions & workflows
│  └─ 📁 workflows/
│     ├─ ci.yml
│     └─ deploy.yml
│
├─ 📁 docker/                                 # Docker configuration (future)
│  ├─ Dockerfile
│  └─ docker-compose.yml
│
├─ Configuration Files
│  ├─ next.config.mjs
│  ├─ tsconfig.json
│  ├─ postcss.config.mjs
│  ├─ tailwind.config.ts
│  ├─ components.json                         # shadcn/ui config
│  ├─ package.json
│  ├─ pnpm-lock.yaml
│  ├─ .env.local                              # Local env (git-ignored)
│  ├─ .env.example                            # Env template
│  ├─ .gitignore
│  ├─ .eslintrc.json
│  ├─ .prettierrc.json
│  └─ README.md
│
└─ Documentation
   ├─ ARCHITECTURE.md                         # Architecture docs
   ├─ NAMING-CONVENTIONS.md                   # Naming rules
   ├─ DEVELOPMENT.md                          # Dev guide
   ├─ API.md                                  # API documentation
   └─ DEPLOYMENT.md                           # Deployment guide
```

---

## Mevcut → Yeni Taşıma Haritası

| Mevcut Dosya | Yeni Konum | İşlem |
|---|---|---|
| `lib/certificates-store.tsx` | `lib/contexts/CertificatesContext.tsx` | Taşı + İçerik gözden geçir |
| `lib/company-data.ts` | `lib/constants/company.constants.ts` | Taşı |
| `lib/data.ts` | `lib/constants/product.constants.ts` | Taşı |
| `lib/types.ts` | `lib/types/index.ts` | Taşı + Bölüntüle |
| `lib/download.ts` | `lib/utils/downloadHelpers.ts` | Taşı |
| `lib/utils.ts` | `lib/utils/index.ts` | Taşı |
| `lib/server/actions.ts` | `lib/server/certificate.actions.ts` + `lib/server/product.actions.ts` | Taşı + Bölüntüle |
| `lib/actions-client.ts` | `lib/client/certificate.actions.ts` | Taşı |
| `components/*` | `components/{feature-name}/*` | Taşı + Yeniden adlandır |
| `app/api/upload/route.ts` | `app/api/certificates/upload/route.ts` | Taşı |
| `temp-*.pdf` | `tests/fixtures/` | Taşı |

---

## Faydalar

✅ **Kurumsal Kalite**: Büyük ölçekli ekiplerin çalışabileceği yapı  
✅ **Skalabilite**: Yeni features kolayca eklenebilir  
✅ **Bakım**: Kod bulmak ve değiştirmek kolay  
✅ **Reusability**: Paylaşılan utilities merkezi lokasyonda  
✅ **Type Safety**: Tüm TypeScript type coverage  
✅ **Testing**: Birimler izole edilip test edilebilir  
✅ **Onboarding**: Yeni ekip üyeleri yapıyı hemen anlar  

---

## ONAY BEKLENIYOR

Lütfen bu planı inceleyip **"Onaylıyorum"** dedikten sonra tüm dosyaları sistemli şekilde taşıyıp yeniden adlandıracağım ve import yollarını otomatik güncelleyeceğim.

**Sormak istediğiniz soruları veya değişiklik isteklerini yazabilirsiniz.**
