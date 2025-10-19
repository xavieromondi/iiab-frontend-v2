<template>
  <div
      class="border-1 border-gray-200 flex align-items-center hover:border-gray-100 border-round-2xl overflow-hidden shadow-1 hover:shadow-6 hover:border-700">

    <div class="h-9rem w-10 md:w-10 py-3 pl-2 bg-orange-600 hover:bg-orange-900 slash-1 shadow-8 flex align-items-end">

      <div class="pl-3 font-bold lg:text-xl uppercase">

        <!-- title -->
        <div class="w-9 pb-3">
          {{ title_ }}
        </div>
        <!-- /title -->

        <!-- rating -->
        <div class="flex fadein animation-duration-500">
          <Rating :model-value="rating_"
                  :stars="5"
                  class="text-yellow-500 flex gap-1" readonly unstyled/>
        </div>
        <!-- /rating -->

        <!-- progress -->
        <ProgressBar :value="progress_ || 0"
                     class="h-1rem w-12rem shadow-1 fadein animation-duration-1000"/>
        <!-- /progress -->
      </div>

    </div>

    <!-- thumbnail -->
    <div class="w-2">
      <img :alt="title_"
           :src="thumbnail_"
           class="w-4rem"/>
    </div>
    <!-- /thumbnail -->

  </div>
</template>



<script lang="js">
export default defineComponent({
  name: "kids-card",
  props: ['title_', 'rating_', 'progress_', 'thumbnail_']
})
</script>