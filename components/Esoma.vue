<template>
  <div class="col-12 p-3">

    <!-- header -->
    <div class="">
      <div class="flex justify-content-between align-items-center shadow-2 border-noround overflow-hidden">
        <div>
          <Button label="Esoma Kids"
                  class="border-noround w-9rem"
                  style="clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)"
                  severity="primary"/>
        </div>
        <div>
          <Button class="border-noround"
                  icon="pi pi-expand"
                  icon-pos="right"
                  label="Maximize" severity="primary" @click="viewFullScreen"/>
        </div>
      </div>
    </div>
    <!-- /header -->


    <!-- esoma iframe -->
    <div id="iframe-box" class="relative">

      <div v-if="full_screen" class="absolute opacity-80 z-3"
           :style="{ height: '5vh', top: '1rem', right: '1rem' }">
        <!-- exit full screen -->
        <Button
            class="bg-orange-500 border-none"
            icon="pi pi-times" rounded raised
            icon-pos="right"
            label="Exit Fullscreen"
            @click="exitFullScreen"/>
      </div>

      <!-- Loading overlay -->
      <div v-if="is_loading" class="flex items-center justify-center absolute z-4">
        <ProgressSpinner/>
      </div>

      <iframe
          :class="'w-full shadow-3 border-none fadein animation-duration-1000 ' + (full_screen ? 'h-screen' : '')"
          :src="esoma_url" style="height: 75vh"
          @load="is_loading=false">
      </iframe>
    </div>
    <!-- /esoma iframe -->
  </div>
</template>


<script lang="js">
export default defineComponent({

  name: "Esoma",

  data() {
    return {
      //view vars.
      is_loading : true,
      full_screen: false,
    }
  },

  computed: {
    server_url() {
      return useState('server_url').value;
    },
    esoma_url() {
      return useState('esoma_url').value;
    },
  },

  methods: {
    //view full screen.
    viewFullScreen() {
      this.full_screen = true;
      const iframe     = document.getElementById('iframe-box');

      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      }
      else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen()
      }
      else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen()
      }
    },

    //exit full screen.
    exitFullScreen() {
      this.full_screen = false;
      document.exitFullscreen();
    },
  }
});
</script>
