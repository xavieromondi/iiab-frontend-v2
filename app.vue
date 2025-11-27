<template>
  <NuxtPage/>
  <Toast class="w-18rem"/>
</template>


<script setup lang="js">
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
