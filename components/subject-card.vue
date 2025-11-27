<template>
  <div
      :class="(subject.available ? 'bg-green-600 ' : 'bg-gray-600') + ' md:h-7rem lg:h-9rem p-2 border-white border-3 flex justify-content-between cursor-pointer border-round-2xl overflow-hidden shadow-1 hover:shadow-6'">

    <div class="w-6 flex align-items-center">

      <!-- title -->
      <div class="w-full p-3 text-white text-sm font-bold">
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
         :src="useThumbnail(title_)"
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
    //check subject availability.
    async check_subject_availability() {
      //check subject availability.
      try {
        this.is_loading = true;
        const res       = await fetch(this.link_, {method: 'HEAD'});
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