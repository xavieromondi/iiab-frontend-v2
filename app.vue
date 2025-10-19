<template>
  <NuxtPage/>
</template>

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
