<template>
  <div
      class="md:h-6rem lg:h-9rem p-2 border-white border-3 bg-purple-600 flex justify-content-between cursor-pointer border-round-2xl overflow-hidden shadow-1 hover:shadow-6">

    <div class="flex align-items-center">

      <!-- title -->
      <div class="w-9 p-3 text-white text-xl font-bold">
        {{ title_ }}
      </div>
      <!-- /title -->

    </div>


    <!-- thumbnail -->
    <img :alt="title_"
         :src="useThumbnail(title_)"
         class="w-6 h-full border-round border-1 border-white shadow-2"/>
    <!-- /thumbnail -->

  </div>
</template>


<script lang="js">

export default defineComponent({
  name : "zim-card",
  props: ['title_', 'rating_', 'progress_', 'thumbnail_', 'link_'],
  data() {
    return {}
  },
})
</script>