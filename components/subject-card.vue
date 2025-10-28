<template>
  <div
      class="md:h-6rem lg:h-9rem p-2 border-white border-3 bg-green-600 flex justify-content-between cursor-pointer border-round-2xl overflow-hidden shadow-1 hover:shadow-6">

    <div class="w-6 flex align-items-center">

      <!-- title -->
      <div class="w-11 p-3 text-white text-lg font-bold">
        <Button :loading="is_loading" rounded outlined size="small" class="border-1 border-white">
          <i v-if="subject.available" class="pi pi-check-circle text-white"/>
          <i v-else class="pi pi-exclamation-circle text-white"/>
        </Button>
        <div class="select-none">{{ title_ }}</div>
      </div>
      <!-- /title -->

    </div>

    <!-- thumbnail -->
    <img :alt="title_"
         :subject="subject"
         :src="getThumbnail(title_)"
         class="w-6 h-full border-round-xl border-1 border-white shadow-2"/>
    <!-- /thumbnail -->

  </div>
</template>


<script lang="js">
export default defineComponent({
  name : "subject-card",
  props: ['title_', 'subject', 'rating_', 'progress_', 'thumbnail_', 'link_'],
  data() {
    return {
      is_loading          : false,
      subject_is_available: true,
    }
  },

  computed: {
    msingi_url() {
      return useState('msingi_url').value;
    },
  },

  methods: {
    //get subject thumbnail.
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
    },

    //check subject availability.
    async check_subject_availability() {
      //check subject availability.
      try {
        this.is_loading = true;
        const res       = await fetch(this.msingi_url + this.link_, {method: 'HEAD'});
        this.is_loading = false;

        //update subject state.
        this.subject_is_available = res.status === 200;
        this.subject.available    = this.subject_is_available;
      }
      catch (e) {
        this.subject_is_loading = false;
        this.is_loading         = false;
      }
    }
  },

  async mounted() {
    //check subject availability.
    await this.check_subject_availability();
  }

})
</script>