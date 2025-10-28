<template>
  <NuxtPage/>
</template>


<script setup lang="js">
//set content provider.
useState('content_provider', () => "msingi_pack");

//mode - url management.
const mode = 'dev';

// urls - dev.
if (mode === 'dev') {
  useState('server_url', () => 'http://localhost:3001/api/');
  useState('kiwix_url', () => 'http://64.23.241.11:3000');
  useState('msingi_url', () => 'http://64.23.241.11/modules/en-wL_Msingi/');
}

// urls - production.
else {
  useState('server_url', () => 'backend/api/');
  const host = window.location.hostname;
  useState('kiwix_url', () => `http://${host}:${3000}`);
  useState('msingi_url', () => `http://${host}/modules/en-wL_Msingi/`);
}
</script>


<style>
@font-face {
  font-family: 'Quicksand';
  src: url('~/fonts/Quicksand-Regular.woff2') format('woff2'),
  url('~/fonts/Quicksand-Regular.woff') format('woff');
}


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
