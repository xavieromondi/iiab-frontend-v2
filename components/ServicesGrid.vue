<template>
  <div class="col-12 p-4">

    <!-- Header -->
    <div class="mb-4 text-center">
      <h1 class="text-4xl font-bold text-green-700">
        <i class="pi pi-server"></i> Available Services
      </h1>
      <p class="text-gray-600 mt-2">Access educational resources and system tools</p>
    </div>

    <!-- Services Grid -->
    <div>

      <!-- Featured Services -->
      <div v-if="featuredServices.length > 0" class="mb-5">
        <h2 class="text-2xl font-bold text-green-700 mb-3">
          <i class="pi pi-star-fill text-yellow-500"></i> Quick Access
        </h2>

        <div class="grid">
          <div
            v-for="service in featuredServices"
            :key="service.id"
            class="col-12 md:col-6 lg:col-4"
          >
            <Card class="service-card h-full">
              <template #header>
                <div class="service-header" :style="{ background: service.color }">
                  <img
                    v-if="service.image"
                    :src="service.image"
                    :alt="service.name"
                    class="service-image"
                  />
                  <i
                    v-else
                    :class="['service-icon', service.icon, 'text-6xl text-white']"
                  />
                </div>
              </template>

              <template #title>
                <div class="flex align-items-center justify-content-between">
                  {{ service.name }}
                  <Tag v-if="service.adminOnly" severity="danger" value="Admin" />
                </div>
              </template>

              <template #content>
                <p class="text-gray-600 line-height-3">
                  {{ service.description }}
                </p>
              </template>

              <template #footer>
                <Button
                  :label="`Open ${service.name}`"
                  icon="pi pi-external-link"
                  class="w-full"
                  :style="{ background: service.color, borderColor: service.color }"
                  @click="openService(service)"
                />
              </template>
            </Card>
          </div>
        </div>
      </div>

      <!-- Services by Category -->
      <div
        v-for="category in categories"
        :key="category"
        class="mb-5"
      >
        <h2 class="text-2xl font-bold text-green-700 mb-3">
          <i :class="getCategoryIcon(category)" /> {{ category }}
        </h2>

        <div class="grid">
          <div
            v-for="service in getServicesByCategory(category)"
            :key="service.id"
            class="col-12 md:col-6 lg:col-4 xl:col-3"
          >
            <Card class="service-card h-full">
              <template #header>
                <div class="service-header" :style="{ background: service.color }">
                  <img
                    v-if="service.image"
                    :src="service.image"
                    :alt="service.name"
                    class="service-image"
                  />
                  <i
                    v-else
                    :class="['service-icon', service.icon, 'text-5xl text-white']"
                  />
                </div>
              </template>

              <template #title>
                <div class="flex align-items-center justify-content-between">
                  {{ service.name }}
                  <Tag v-if="service.adminOnly" severity="danger" value="Admin" />
                </div>
              </template>

              <template #content>
                <p class="text-gray-600 line-height-3">
                  {{ service.description }}
                </p>
              </template>

              <template #footer>
                <Button
                  label="Open"
                  icon="pi pi-external-link"
                  size="small"
                  class="w-full"
                  :style="{ background: service.color, borderColor: service.color }"
                  @click="openService(service)"
                />
              </template>
            </Card>
          </div>
        </div>
      </div>

    </div>

    <!-- SERVICE VIEWER DIALOG -->
    <Dialog
      v-model:visible="showServiceDialog"
      :header="activeService?.name"
      :closable="true"
      :modal="true"
      :dismissableMask="false"
      maximizable
      class="service-dialog"
      :style="{ width: '95vw' }"
      :contentStyle="{ height: '85vh', padding: 0 }"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between w-full pr-3">
          <div class="flex align-items-center gap-3">
            <img 
              v-if="activeService?.image" 
              :src="activeService.image" 
              :alt="activeService.name"
              class="h-2rem"
            />
            <i v-else :class="[activeService?.icon, 'text-2xl']" :style="{ color: activeService?.color }"></i>
            <span class="font-bold text-xl">{{ activeService?.name }}</span>
          </div>
          <div class="flex gap-2">
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              outlined
              size="small"
              :loading="isLoading"
              @click="refreshIframe"
            />
            <Button
              icon="pi pi-external-link"
              label="Open in New Tab"
              outlined
              size="small"
              @click="openInNewTab"
            />
          </div>
        </div>
      </template>

      <div class="iframe-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="iframe-loading">
          <ProgressSpinner />
          <p class="mt-3">Loading {{ activeService?.name }}...</p>
        </div>

        <!-- Error State (iframe blocked) -->
        <div v-else-if="iframeError" class="iframe-error">
          <i class="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
          <h3>{{ activeService?.name }} cannot be embedded</h3>
          <p class="text-gray-600 mb-4">
            This service has security settings that prevent it from being displayed in an iframe.
          </p>
          <Button
            :label="`Open ${activeService?.name} in New Tab`"
            icon="pi pi-external-link"
            severity="success"
            size="large"
            @click="openInNewTab"
          />
        </div>
        
        <!-- Iframe -->
        <iframe
          v-if="activeService && !iframeError"
          :key="iframeKey"
          ref="serviceIframe"
          :src="activeService.url"
          class="service-iframe"
          @load="onIframeLoad"
          @error="onIframeError"
        />
      </div>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'

const route = useRoute()
const router = useRouter()

const updateUrl = (params: Record<string, any>) => {
  const query = {...route.query}
  Object.keys(params).forEach(key => {
    const val = params[key]
    if (val === null || val === undefined || val === '') delete query[key]
    else query[key] = val
  })
  router.replace({query})
}
import { computed, ref } from 'vue'

const baseURL = useRuntimeConfig().app.baseURL || '/'
const withBase = (path: string) => {
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
  const clean = path.startsWith('/') ? path.slice(1) : path
  return `${base}${clean}`
}

/* SERVICES CONFIG */
const services = [
  {
    id: 'kolibri',
    name: 'Kolibri',
    description: 'Interactive educational platform with lessons, videos, and exercises',
    url: '/kolibri/',
    icon: 'pi pi-graduation-cap',
    image: withBase('kolibri.jpg'),
    category: 'Education',
    color: '#FF9800',
    openInTab: true // Force open in new tab
  },
  {
    id: 'kiwix',
    name: 'Kiwix Library',
    description: 'Offline Wikipedia and educational content library',
    url: '/kiwix/',
    icon: 'pi pi-book',
    image: withBase('kiwix.jpg'),
    category: 'Education',
    color: '#2196F3'
  },
  // NEXTCLOUD - Added here as a featured service
  {
    id: 'nextcloud',
    name: 'Nextcloud',
    description: 'File sharing, collaboration, and cloud storage platform',
    url: '/nextcloud/',
    icon: 'pi pi-cloud',
    category: 'Productivity',
    color: '#0082C9',
    openInTab: true // Nextcloud works better in a new tab
  },
  {
    id: 'msingi',
    name: 'Msingi Learning',
    description: 'Educational module content',
    url: '/modules/en-wL_Msingi/',
    icon: 'pi pi-book',
    image: withBase('msingi.jpg'),
    category: 'Modules',
    color: '#9C27B0'
  },
  {
    id: 'esomakids',
    name: 'Esoma Kids',
    description: 'Educational content for kids',
    url: '/modules/en-esomakids/start/',
    icon: 'pi pi-star',
    image: withBase('esoma.jpg'),
    category: 'Modules',
    color: '#FF5722'
  },
  {
    id: 'gcf2021',
    name: 'GCF Learn Free',
    description: 'Free online learning for essential skills and computer literacy',
    url: '/modules/en-GCF2021/',
    icon: 'pi pi-desktop',
    category: 'Modules',
    color: '#00BCD4'
  },
  {
    id: 'scratch',
    name: 'Scratch Programming',
    description: 'Learn coding and create interactive stories, games, and animations',
    url: '/modules/en-scratch/',
    icon: 'pi pi-code',
    image: withBase('scratch.jpeg'),
    category: 'Modules',
    color: '#FF6B6B'
  },
  {
    id: 'w3schools',
    name: 'W3Schools',
    description: 'Web development tutorials - HTML, CSS, JavaScript, and more',
    url: '/modules/en-wl_w3schools/',
    icon: 'pi pi-globe',
    category: 'Modules',
    color: '#4CAF50'
  },
  {
    id: 'matomo',
    name: 'Matomo Analytics',
    description: 'Website analytics and visitor statistics',
    url: '/matomo/',
    icon: 'pi pi-chart-bar',
    image: withBase('matomo.jpg'),
    category: 'Analytics',
    color: '#607D8B'
  },
  {
    id: 'usb',
    name: 'USB / Local Content',
    description: 'Upload and access USB and local content',
    url: '/local_content/',
    icon: 'pi pi-folder-open',
    category: 'Content',
    color: '#795548'
  },
  {
    id: 'admin',
    name: 'Admin Console',
    description: 'IIAB System Administration',
    url: '/admin/',
    icon: 'pi pi-cog',
    category: 'Administration',
    color: '#F44336',
    adminOnly: true
  }
]

/* COMPUTED */
const featuredServices = computed(() =>
  services.filter(s => ['kolibri', 'kiwix', 'nextcloud', 'w3schools'].includes(s.id))
)

const categories = computed(() => {
  const set = new Set(
    services
      .filter(s => !featuredServices.value.some(f => f.id === s.id))
      .map(s => s.category)
  )
  return Array.from(set).sort()
})

const getServicesByCategory = (category: string) =>
  services.filter(
    s =>
      s.category === category &&
      !featuredServices.value.some(f => f.id === s.id)
  )

const getCategoryIcon = (category: string) => ({
  Education: 'pi pi-book',
  Content: 'pi pi-file',
  Analytics: 'pi pi-chart-line',
  Administration: 'pi pi-cog',
  Modules: 'pi pi-folder',
  Productivity: 'pi pi-briefcase'
}[category] || 'pi pi-box')

/* IFRAME LOGIC */
const showServiceDialog = ref(false)
const activeService = ref<any>(null)
const isLoading = ref(false)
const iframeKey = ref(0)
const serviceIframe = ref(null)
const iframeError = ref(false)
let iframeTimeout: any = null

const openService = (service: any) => {
  // If service should open in new tab, do that directly
  if (service.openInTab) {
    window.open(service.url, '_blank')
    return
  }

  // Otherwise try iframe
  activeService.value = service
  isLoading.value = true
  iframeError.value = false
  showServiceDialog.value = true

  // Set timeout to detect if iframe fails to load
  iframeTimeout = setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false
      iframeError.value = true
    }
  }, 10000) // 10 second timeout
}

const onIframeLoad = () => {
  clearTimeout(iframeTimeout)
  isLoading.value = false
  iframeError.value = false
}

const onIframeError = () => {
  clearTimeout(iframeTimeout)
  isLoading.value = false
  iframeError.value = true
}

const refreshIframe = () => {
  isLoading.value = true
  iframeError.value = false
  iframeKey.value++
  
  // Reset timeout
  iframeTimeout = setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false
      iframeError.value = true
    }
  }, 10000)
}

const openInNewTab = () => {
  if (activeService.value) {
    window.open(activeService.value.url, '_blank')
    showServiceDialog.value = false
  }
}

onMounted(() => {
  updateUrl({provider: 'services', grade: null, subject: null, link: null})
})
</script>

<style scoped>
.service-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.service-header {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px 6px 0 0;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-icon {
  color: white;
}

.iframe-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f5f5f5;
}

.service-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.iframe-loading,
.iframe-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 10;
  padding: 2rem;
  text-align: center;
}

.iframe-error h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

/* Make dialog full height */
:deep(.p-dialog) {
  height: 90vh;
}

:deep(.p-dialog-content) {
  flex: 1;
  overflow: hidden;
  padding: 0 !important;
}

:deep(.p-dialog-header) {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}
</style>
