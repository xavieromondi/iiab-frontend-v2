export default defineEventHandler(async () => {
  try {
    const services = [
      {
        id: 'kolibri',
        name: 'Kolibri',
        description: 'Interactive educational platform with lessons, videos, and exercises',
        url: '/kolibri/',
        icon: 'pi-graduation-cap',
        image: '/kolibri.svg',
        category: 'Education',
        color: '#FF9800',
        enabled: true
      },
      {
        id: 'kiwix',
        name: 'Kiwix Library',
        description: 'Offline Wikipedia and educational content library',
        url: '/kiwix/',
        icon: 'pi-book',
        image: null,
        category: 'Education',
        color: '#2196F3',
        enabled: true
      },
      {
        id: 'matomo',
        name: 'Matomo Analytics',
        description: 'Website analytics and visitor statistics',
        url: '/matomo/',
        icon: 'pi-chart-bar',
        image: null,
        category: 'Analytics',
        color: '#4CAF50',
        enabled: true
      },
      {
        id: 'msingi',
        name: 'Msingi Learning',
        description: 'Educational module content',
        url: '/modules/en-wL_Msingi/',
        icon: 'pi-book',
        image: null,
        category: 'Modules',
        color: '#9C27B0',
        enabled: true
      },
      {
        id: 'esomakids',
        name: 'Esoma Kids',
        description: 'Educational content for kids',
        url: '/modules/en-esomakids/start/',
        icon: 'pi-star',
        image: null,
        category: 'Modules',
        color: '#FF5722',
        enabled: true
      },
      {
        id: 'africana',
        name: 'Africana Academy',
        description: 'African educational resources',
        url: '/modules/en-africana_academy/',
        icon: 'pi-globe',
        image: '/en-africana_academy.png',
        category: 'Modules',
        color: '#607D8B',
        enabled: true
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
        icon: 'pi-cog',
        image: null,
        category: 'Administration',
        color: '#F44336',
        enabled: true,
        adminOnly: true
      }
    ]

    return {
      success: true,
      services
    }
  } catch (error) {
    let message = 'Unknown error'

    if (error instanceof Error) {
      message = error.message
    }

    return {
      success: false,
      services: [],
      error: message
    }
  }
})
