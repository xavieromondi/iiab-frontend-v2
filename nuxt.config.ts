import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({

    compatibilityDate: '2025-07-15',

    ssr: false,

    modules: [
        '@primevue/nuxt-module'
    ],

    primevue: {
        options: {
            theme: {
                preset: Aura
            }
        }
    },

    css: [
        'primeflex/primeflex.css',
        'primeflex/themes/primeone-light.css',
        'primeicons/primeicons.css',
    ],

    app: {
        baseURL: '/home/',
    },

    // dev: cors
    nitro: {
        cors: true
    }
})
