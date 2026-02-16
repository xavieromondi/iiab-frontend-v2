# Frontend Documentation

Project root: `iiab-frontend`

## 1) About Frontend
This project is a Nuxt 3 SPA (`ssr: false`) using PrimeVue components and filesystem-hosted media.

- Runtime: Nuxt 3 + Vue 3
- UI library: PrimeVue + PrimeFlex + PrimeIcons
- Base URL: `/home/` (configured in `nuxt.config.ts`)
- Main state model: `useState(...)` in `app.vue` + page/components
- API target: backend routes under `backend/api/` in production

## 2) Root Folder Walkthrough

### Core app/config files
- `.gitignore`: excludes build outputs, dependencies, logs, env files.
- `README.md`: default Nuxt starter guide.
- `package.json`: scripts (`dev/build/generate/preview`) and dependencies (Nuxt, PrimeVue, Chart.js, image/fonts modules).
- `package-lock.json`: npm lockfile.
- `nuxt.config.ts`:
  - `ssr: false`
  - modules: `@primevue/nuxt-module`, `@nuxt/fonts`, `@nuxt/image`
  - local fonts provider
  - CSS includes PrimeFlex/PrimeIcons
  - `app.baseURL = '/home/'`
- `tsconfig.json`: extends Nuxt-generated tsconfig.
- `app.vue`: global runtime setup (URLs, Matomo bootstrapping, localStorage persistence, session/UI restore).
- `pages/index.vue`: root page orchestration and top-level nav/login/logout routing.

### Build/generated/static artifacts in repo
- `200.html`, `404.html`, `_payload.json`, `favicon.ico`, `robots.txt`
- `.nuxt/`, `.output/`, `_nuxt/`, `dist` symlink
- `node_modules/`

### Extra directories
- `assets/`: legacy IIAB assets (`index.php`, `js-menu.js`).
- `components/`: main UI feature components.
- `composables/`: shared frontend helper logic.
- `public/`: static images, logos, fonts.
- `server/api/iiab-services.ts`: local Nuxt API endpoint returning service metadata.
- `snippets/post.js`: standalone Express/Nodemailer sample script.
- `docs/`: documentation folder (now includes this file).

## 3) Runtime State and Global App Behavior

Implemented in `app.vue` and consumed across the app:

- `useState('content_provider')`: active learning provider (default `msingi`).
- URL/config states:
  - `server_url`
  - `kiwix_url`, `msingi_url`, `esoma_url`, `africana_url`
  - `kolibri_url`, `kolibri_channel_url`, `kolibri_content_url`
  - `usb_url`
- Matomo states:
  - `matomo_site_id` dynamic by hostname (`192.168.2.241` => `2`, else `1`)
  - `matomo_dims` mapping (grade=2, group=3, school=4, pupil_id=5)
- localStorage persistence:
  - restores `iiab_session` and `iiab_ui`
  - persists both via watchers
  - clears on logout flow
- Matomo load:
  - script from `/matomo/matomo.js`
  - tracker URL `/matomo/matomo.php`
  - applies custom dimensions from `session.meta`

## 4) Page and Navigation Flow

### `pages/index.vue`
- Initializes global states: `ui`, `session`, `logout`.
- Chooses screen by `ui`:
  - `login` => `Login.vue`
  - `registration` => `Registration.vue`
  - `learn` => `Learn.vue`
  - `dashboard` => `Dashboard.vue`
- Admin top navbar shown outside login.
- Logout clears admin state and local persisted session/UI.

### `components/Learn.vue`
- User navbar + provider switching.
- Provider list:
  - `msingi`, `africana`, `local`, `general`, `esoma`, `kolibri`, `services`, `assignments`
- Renders provider component based on `content_provider`.
- Keeps provider in URL query (`provider=...`) and clears stale `grade/subject/link` when switching providers.
- Supports mobile drawer menu.
- Calls `useSaveSession()` on logout before returning to login.
- Note: component contains duplicate `Assignments` branch (`v-else-if` repeated).

## 5) Component-by-Component Documentation

### Authentication & Setup
- `components/Login.vue`
  - User login selects **school + class/group** (no pupil selection step).
  - Creates session via `POST {server_url}sessions` with `school`, `class_`, `pupil: null`.
  - Loads schools, classes, class types from backend.
  - Supports admin login via `/admins` endpoint.
  - Pushes Matomo dimension data on login (`school`, `grade`, `group`, optional `pupil_id`).

- `components/Registration.vue`
  - Admin CRUD console for entities (regions, schools, classes, class types, teachers, pupils, subjects, admins).
  - Dynamic table + dynamic form model from entity metadata.
  - Supports filtering by active school for nested entities.
  - Uses backend CRUD endpoints by entity name.
  - Includes delete confirmation dialog and recent-items view.

### Analytics
- `components/Dashboard.vue`
  - Loads base entities/sessions from backend.
  - Integrates Matomo summary + event metrics for dashboard KPIs.
  - Filters by `school`, `grade`, `group` and builds Matomo segment string using dimensions 4/2/3.
  - Uses Matomo methods through backend proxy:
    - summary (`VisitsSummary.get`, `Actions.get` via backend default)
    - subject events (`Events.getNameFromCategory` with category `Subject`)
    - school/class breakdowns (`VisitsSummary.get` with segments)
  - Renders tables + charts (donut/radar/line).

### Content Providers
- `components/Msingi.vue`
  - Parses Msingi HTML index into grade->subject lists.
  - Grade and subject navigation, iframe viewer, fullscreen.
  - Deep-link query support: `provider`, `grade`, `subject`, `link`.

- `components/Africana.vue`
  - Parses Africana HTML sections into grades and subjects.
  - Subject viewer in iframe, fullscreen.
  - Deep-link query support: `provider`, `grade`, `subject`, `link`.

- `components/Zims.vue`
  - Loads Kiwix catalog entries (`/kiwix/catalog/v2/entries?...`).
  - Entry listing, paging, entry viewer iframe + fullscreen.
  - Deep-link support with `provider=general` and `subject`.

- `components/Esoma.vue`
  - Single iframe view for Esoma Kids.
  - Fullscreen support.
  - Sets URL to `provider=esoma` and clears stale lesson params.

- `components/Kolibri.vue`
  - Fetches channels and topic trees from Kolibri API endpoints.
  - Topic and subtopic drill-down with viewed topic stack.
  - Renders PDF files where available.
  - Sets URL `provider=kolibri`.

- `components/LocalContent.vue`
  - Two modes: `usb` (list from USB index HTML) and `videos` (uploaded local files).
  - Video upload/read/delete through backend `/files` endpoint.
  - Sets URL `provider=local`.

- `components/USB.vue`
  - Legacy dedicated local video manager (upload/list/play/delete).
  - Uses backend `/files` endpoint.

- `components/ServicesGrid.vue`
  - Service catalog cards + category grouping.
  - Uses `baseURL` helper for static images so assets resolve correctly under `/home/`.
  - Includes service iframe dialog with fallback to open in new tab.
  - Sets URL `provider=services`.
  - Services include: Kolibri, Kiwix, Nextcloud, Msingi, Esoma, GCF, Scratch, W3Schools, Matomo, USB/Local Content, Admin.

- `components/Assignments.vue`
  - Student view: load by assignment code, answer questions, submit files.
  - Teacher view: unlock with teacher code, create/edit/delete assignments, upload attachments, review submissions, grade short answers.
  - Backend endpoints used:
    - `/assignments`
    - `/assignments/files`
    - `/assignments/submissions`

### Presentation/Card Components
- `components/kids-card.vue`: subject card style for kids-oriented content.
- `components/subject-card.vue`: reusable subject tile with availability check (`HEAD` request).
- `components/zim-card.vue`: reusable Kiwix/ZIM entry card.

## 6) Composables

- `composables/useSaveSession.js`
  - Adds `end_time` and sends session update to `/sessions`.

- `composables/useUpdateSubjectSession.js`
  - Updates per-subject entry stats in `session.data.entries`.
  - Calls `useSaveSession()`.
  - Tracks Matomo event `trackEvent('Subject', 'View', subject_name)`.

- `composables/useThumbnail.js`
  - Maps subject keywords to local thumbnail filenames in `public/`.

## 7) Nuxt Server Endpoint in Frontend Repo

- `server/api/iiab-services.ts`
  - Returns static service metadata array (`success`, `services`).
  - Contains optional admin-only markers and categories.
  - Not the primary source for `ServicesGrid.vue` (which currently has local service config in component).

## 8) Assets and Public Folder Documentation

### `assets/`
- `assets/index.php`: redirect helper to `start/`.
- `assets/js-menu.js`: legacy IIAB menu JS implementation (large standalone script).

### `public/` static files
- Branding/logo:
  - `colored-text-logo.svg`
  - `green-orange-logo.svg`
  - `white-text-logo.svg`
  - `kolibri.svg`
- UI/login/background:
  - `login-image.jpg`
  - `bg-1.png`
- Service images:
  - `kolibri.jpg`, `kiwix.jpg`, `msingi.jpg`, `esoma.jpg`, `matomo.jpg`, `scratch.jpeg`, `en-africana_academy.png`
- Subject/thumbnail images:
  - `english.jpg`, `science.jpg`, `math.jpg`, `swahili.jpg`, `technology.jpg`, `social.jpg`, `nature.jpg`, `food.jpg`, `electronics.jpg`, `church.jpg`, `history.jpg`, `stories.jpg`, `cognitive.jpg`, `computers.jpg`, `games.jpg`, `chemistry.jpg`
- Misc:
  - `favicon.ico`, `robots.txt`
  - `public/fonts/Quicksand-Regular.woff`, `public/fonts/Quicksand-Regular.woff2`

## 9) File Inventory (Text/Code Files)

Current non-generated text/code files in this repo:

- `.gitignore`
- `200.html`
- `404.html`
- `README.md`
- `_payload.json`
- `app.vue`
- `assets/index.php`
- `assets/js-menu.js`
- `components/Africana.vue`
- `components/Assignments.vue`
- `components/Dashboard.vue`
- `components/Esoma.vue`
- `components/Kolibri.vue`
- `components/Learn.vue`
- `components/LocalContent.vue`
- `components/Login.vue`
- `components/Msingi.vue`
- `components/Registration.vue`
- `components/ServicesGrid.vue`
- `components/USB.vue`
- `components/Zims.vue`
- `components/kids-card.vue`
- `components/subject-card.vue`
- `components/zim-card.vue`
- `composables/useSaveSession.js`
- `composables/useThumbnail.js`
- `composables/useUpdateSubjectSession.js`
- `nuxt.config.ts`
- `package-lock.json`
- `package.json`
- `pages/index.vue`
- `robots.txt`
- `server/api/iiab-services.ts`
- `snippets/post.js`
- `tsconfig.json`

## 10) How Current Frontend Implements Your Project

- Group-based login/session:
  - `Login.vue` logs in with school + class/group only.
  - Session payload centers on `school` and `class_`.
- Session persistence:
  - `app.vue` stores/restores session and UI from localStorage.
  - Logout clears persisted keys.
- Matomo integration:
  - `app.vue` bootstraps tracker from `/matomo/`, chooses site ID by hostname, applies custom dimensions.
  - `useUpdateSubjectSession.js` tracks subject view events.
  - `Dashboard.vue` consumes Matomo summaries/events through backend proxy.
- Deep links:
  - `Learn.vue` syncs `provider` query and clears stale params on provider change.
  - `Msingi.vue`, `Africana.vue`, `Zims.vue`, `Esoma.vue`, `Kolibri.vue`, `LocalContent.vue`, `ServicesGrid.vue` update query state.
- Services image/baseURL fix:
  - `ServicesGrid.vue` builds image URLs using runtime baseURL helper and uses cover-style card images.

## 11) Notable Implementation Notes

- `components/Learn.vue` has duplicate `Assignments` branch in template.
- `components/Zims.vue` references `state` in `getEntries()` without local definition in shown code path.
- `server/api/iiab-services.ts` and `components/ServicesGrid.vue` both define service catalogs (possible drift risk).
- Several static HTML/export artifacts exist in root (`200.html`, `404.html`) and may not reflect live SPA state.

