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
         :src="getThumbnail(title_)"
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

  computed: {},

  methods: {
    getThumbnail(title_) {

      const subject_title = title_.toLowerCase();

      //specific subjects.
      if (subject_title.includes('computer') || subject_title.includes('technology')) return 'technology.jpg';
      else if (subject_title.includes('english') || subject_title.includes('grammar')) return 'english.jpg'
      else if (subject_title.includes('chemistry') || subject_title.includes('lab')) return 'science.jpg';
      else if (subject_title.includes('math') || subject_title.includes('calculat')) return 'math.jpg';
      else if (subject_title.includes('christ') || subject_title.includes('church')) return 'church.jpg';
      else if (subject_title.includes('swahili') || subject_title.includes('swahili')) return 'swahili.jpg';
      else if (subject_title.includes('geograp') || subject_title.includes('environ') || subject_title.includes('earth')) return 'nature.jpg';
      else if (subject_title.includes('electr') || subject_title.includes('engineer')) return 'electronics.jpg';
      else if (subject_title.includes('agricul') || subject_title.includes('hygiene') || subject_title.includes('nutrition')) return 'food.jpg';
      else if (subject_title.includes('science')) return 'science.jpg';

      //default image.
      return 'social.jpg'
    }
  }

})
</script>