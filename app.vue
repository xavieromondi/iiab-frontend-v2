<template>
  <NuxtPage/>
  <Toast class="w-18rem"/>
</template>


<script setup lang="js">
import {watch} from 'vue';

useState('load-init', () => true);

//set content provider.
useState('content_provider', () => "msingi");


//dev | production mode - url management.
const mode = 'production';

// urls - dev.
const IP_ADDRESS = 'http://64.23.241.11';

if (mode === 'dev') {
  useState('server_url', () => 'http://localhost:3001/api/');
  useState('kiwix_url', () => IP_ADDRESS + ':3000');
  useState('msingi_url', () => IP_ADDRESS + '/modules/en-wL_Msingi/');
  useState('esoma_url', () => IP_ADDRESS + '/modules/en-esomakids/start/');
  useState('africana_url', () => IP_ADDRESS + '/modules/en-africana_academy/');

  //kolibri.
  useState('kolibri_url', () => IP_ADDRESS + '/kolibri');
  useState('kolibri_channel_url', () => IP_ADDRESS + '/kolibri/api/content/channel/');
  useState('kolibri_content_url', () => IP_ADDRESS + '/kolibri/api/content/contentnode/?parent=');

  //usb.
  useState('usb_url', () => IP_ADDRESS + '/usb/');
}

// urls - production.
else {
  useState('server_url', () => 'backend/api/');

  //3rd party urls.
  const HOST = window.location.origin;
  useState('kiwix_url', () => HOST + ':3000');
  useState('msingi_url', () => HOST + '/modules/en-wL_Msingi/');
  useState('esoma_url', () => HOST + '/modules/en-esomakids/start/');
  useState('africana_url', () => HOST + '/modules/en-africana_academy/');

  //kolibri.
  useState('kolibri_url', () => HOST + '/kolibri');
  useState('kolibri_channel_url', () => HOST + '/kolibri/api/content/channel/');
  useState('kolibri_content_url', () => HOST + '/kolibri/api/content/contentnode/?parent=');

  //usb.
  useState('usb_url', () => HOST + '/usb/');
}

//matomo tracking config.
useState('matomo_site_id', () => '1');
useState('matomo_dims', () => ({
  grade   : 2,
  group   : 3,
  school  : 4,
  pupil_id: 5
}));

if (process.client) {
  const HOST = window.location.origin;
  const matomo_url = HOST + '/matomo/';
  const hostname = window.location.hostname;
  const site_id = (hostname === '192.168.2.241') ? '2' : '1';
  useState('matomo_site_id').value = site_id;

  const applyMatomoDimensions = (meta) => {
    if (!window._paq || !meta) return;
    const key = JSON.stringify(meta);
    if (window._matomoDimsKey === key) return;
    window._matomoDimsKey = key;

    const dims = useState('matomo_dims').value;
    if (dims?.school) _paq.push(['setCustomDimension', dims.school, meta.school || '']);
    if (dims?.grade) _paq.push(['setCustomDimension', dims.grade, meta.grade || '']);
    if (dims?.group) _paq.push(['setCustomDimension', dims.group, meta.group || '']);
    if (dims?.pupil_id) _paq.push(['setCustomDimension', dims.pupil_id, meta.pupil_id || '']);
    _paq.push(['trackPageView']);
  };

  //restore session & ui.
  const storedSession = localStorage.getItem('iiab_session');
  const storedUi = localStorage.getItem('iiab_ui');
  if (storedSession) {
    try {
      useState('session').value = JSON.parse(storedSession);
    } catch (e) {
      localStorage.removeItem('iiab_session');
    }
  }
  if (storedUi) {
    useState('ui').value = storedUi;
  }

  //persist session & ui.
  watch(useState('session'), (val) => {
    if (val) localStorage.setItem('iiab_session', JSON.stringify(val));
    else localStorage.removeItem('iiab_session');
    if (val?.meta) applyMatomoDimensions(val.meta);
  }, {deep: true});

  watch(useState('ui'), (val) => {
    if (val) localStorage.setItem('iiab_ui', val);
  });

  if (!window._matomoLoaded) {
    window._matomoLoaded = true;
    const _paq = window._paq = window._paq || [];

    _paq.push(['setTrackerUrl', matomo_url + 'matomo.php']);
    _paq.push(['setSiteId', useState('matomo_site_id').value]);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    const d = document;
    const g = d.createElement('script');
    const s = d.getElementsByTagName('script')[0];
    g.async = true;
    g.src = matomo_url + 'matomo.js';
    s.parentNode.insertBefore(g, s);
  }

  //apply dimensions after tracker is ready (if restored session has meta).
  if (useState('session').value?.meta) {
    applyMatomoDimensions(useState('session').value.meta);
  }
}
</script>


<style>
body {
  padding: 0;
  margin: 0;
  font-family: 'Quicksand', sans-serif;
  background-color: white !important;
}


.slash {
  clip-path: polygon(0% 0%, 80% 0%, 100% 100%, 0% 100%)
}

.slash-1 {
  clip-path: polygon(0% 0%, 70% 0%, 95% 100%, 0% 100%)
}
</style>
