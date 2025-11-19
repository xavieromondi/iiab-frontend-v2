import Material from '@primeuix/themes/material';

export default defineNuxtConfig({

    compatibilityDate: '2025-07-15',

    ssr: false,

    modules: ['@primevue/nuxt-module', '@nuxt/fonts', '@nuxt/image'],

    primevue: {
        options: {
            theme: {
                preset: Material
            }
        }
    },

    fonts: {
        provider: "local"
    },

    css: [
        'primeflex/primeflex.css',
        'primeflex/themes/primeone-light.css',
        'primeicons/primeicons.css',
    ],

    app: {
        baseURL: '/home/',
    },

})