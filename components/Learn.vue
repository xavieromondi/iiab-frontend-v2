<template>
  <div class="grid m-0 p-3 lg:px-4 lg:pt-2 bg-white text-gray-700">

    <!-- entry -->
    <div v-if="entry" class="col-12 fadein animation-duration-1000">

      <!-- header -->
      <div
          class="md:h-3rem border-1 border-gray-200 flex align-items-center justify-content-between bg-orange-600 text-white">

        <!-- entry image -->
        <div class="h-full w-3 lg:w-1 p-1 pl-2 bg-white">
          <img :src="`${kiwix_url}${entry.links[0].href}`" class="h-full" :alt="entry.title"/>
        </div>
        <!-- entry image -->

        <!-- entry title -->
        <div class="w-full pl-3 font-bold">
          {{ entry.title }}
        </div>
        <!-- /entry title -->

        <!-- full screen -->
        <Button
            class="hidden md:flex h-full w-7rem md:w-12rem border-noround bg-orange-800 border-none border-right-1 border-orange-700"
            icon="pi pi-expand"
            label="Maximize"
            icon-pos="right"
            @click="fullScreen"/>

        <!-- close entry -->
        <Button class="hidden md:flex h-full w-8rem md:w-10rem border-noround bg-orange-800 border-none"
                icon="pi pi-times"
                label="Close"
                icon-pos="right"
                @click="closeEntry"/>
      </div>
      <!-- /header -->


      <!-- summary -->
      <div class="p-3 font-bold border-1 border-gray-300 flex align-items-center justify-content-between text-sm">
        {{ entry.summary }}
      </div>
      <!-- summary -->


      <!-- content -->
      <div class="p-0 font-bold shadow-1 border-left-1 border-right-1 border-bottom-1 border-gray-300">

        <!-- loading progress -->
        <div v-if="is_loading" class="text-center fadein animation-duration-1000">
          <ProgressSpinner/>
        </div>
        <!-- /loading progress -->

        <!-- topic content -->
        <div v-else id="content-div" class="h-30rem bg-white flex flex-column"
             :style="full_screen? {height: '90vh' } : {} ">

          <div v-if="full_screen" class="absolute opacity-80"
               :style="{ height: '5vh', top: '1rem', right: '1rem' }">
            <!-- exit full screen -->
            <Button
                class="w-10rem h-full border-noround bg-orange-800 border-none"
                icon="pi pi-times" rounded
                icon-pos="right"
                label="Exit Fullscreen"
                @click="exitFullScreen"/>
          </div>

          <!-- iframe -->
          <iframe id="remoteFrame"
                  :src="`${kiwix_url}${entry.links[1].href}`"
                  :style="full_screen? {height: '90vh' } : {} "
                  class="w-full h-full border-none fadein animation-duration-1000">
          </iframe>

        </div>
        <!-- /topic content -->

        <!-- close entry -->
        <div class="md:hidden flex justify-content-end">
          <Button class="border-noround bg-orange-800 border-none"
                  icon="pi pi-times"
                  label="Close"
                  icon-pos="right"
                  @click="closeEntry"/>
        </div>
      </div>
      <!-- content -->

    </div>
    <!-- entry -->


    <!-- entries grid -->
    <template v-else>

      <!-- controls -->
      <div class="col-12 flex justify-content-end">
        <Button
            class="h-2rem w-4rem border-noround shadow-1 bg-orange-700 border-none border-noround border-round-left-2xl"
            :disabled="!start"
            icon="pi pi-angle-left" @click="getPreviousEntries"/>

        <Button class="h-2rem w-4rem border-noround shadow-1 bg-orange-700 border-none"
                :loading="is_loading" icon="pi pi-refresh" @click="getEntries()"/>

        <Button
            class="h-2rem w-4rem border-noround shadow-1 bg-orange-700 border-none border-noround border-round-right-2xl text-sm"
            :disabled="!next"
            icon="pi pi-angle-right" @click="getNextEntries"/>
      </div>
      <!-- /controls -->


      <!-- loading -->
      <div v-if="is_loading" class="col-12 text-center fadein animation-duration-2000">
        <ProgressSpinner/>
      </div>
      <!-- /loading -->


      <!-- entries -->
      <template v-else>
        <div v-for="(entry_, ix) in entries"
             :class="`col-12 md:col-6 lg:col-4 bg-white flipleft animation-duration-${ ix*200 } animation-ease-in select-none cursor-pointer text-white`"
             @click="viewEntry(entry_)">

          <Kids-card
              :title_="entry_.title"
              :rating_="entry_.rating || 0"
              :progress_="entry_.progress || 0"
              :thumbnail_="`${kiwix_url}${entry_.links[0].href}`"/>

        </div>
      </template>
      <!-- /entries -->

    </template>
    <!-- entries grid -->

  </div>
</template>


<script setup>
</script>


<script lang="js">
export default defineComponent({

  props: ['close'],

  name: "Subjects",

  data() {
    return {
      //entries.
      entry  : null,
      entries: [],

      //pagination.
      start: 0,
      end  : 9,

      //pagination controls.
      prev: null,
      next: 1,

      //UI.
      is_loading : false,
      full_screen: false
    }
  },

  computed: {
    server_url() {
      return useState('server_url').value;
    },
    kiwix_url() {
      return useState('kiwix_url').value;
    },
  },

  watch: {
    close(newVal, oldVal) {
      this.closeEntry()
    }
  },

  methods: {

    fullScreen() {

      this.full_screen = true;
      const iframe     = document.getElementById('content-div');

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

    exitFullScreen() {
      this.full_screen = false;
      document.exitFullscreen();
    },

    //get previous.
    getPreviousEntries() {
      if (this.start !== 0) {
        this.start = this.start - 9;
        this.getEntries('prev');
      }
    },

    //getNext.
    getNextEntries() {
      this.start = this.start + 9;
      this.getEntries('next');
    },

    //get entries.
    async getEntries() {

      try {
        //loading init.
        this.is_loading = true;
        const entries   = await $fetch(`${this.kiwix_url}/kiwix/catalog/v2/entries?start=${this.start}&count=${this.end}`);
        this.is_loading = false;


        //empty list.
        if (entries.size < 1000) {
          //loading stop.
          this.is_loading = false;

          //notify.
          if (state === 'next') {
            this.next = false;
            this.notify('Done.', 'No more entries.', 'success');
          }
          return;
        }
        //activate next.
        else this.next = true;


        //process data.
        const xmlText = await entries.text();

        //parse content.
        const parser   = new DOMParser();
        const xmlDoc   = parser.parseFromString(xmlText, 'text/xml');
        const entries_ = xmlDoc.getElementsByTagName('entry');

        //populate entries.
        this.entries = Array.from(entries_).map(entry => ({

          id          : entry.querySelector('id')?.textContent,
          title       : entry.querySelector('title')?.textContent,
          summary     : entry.querySelector('summary')?.textContent,
          language    : entry.querySelector('language')?.textContent,
          tags        : entry.querySelector('tags')?.textContent,
          updated     : entry.querySelector('updated')?.textContent,
          articleCount: entry.querySelector('articleCount')?.textContent,
          mediaCount  : entry.querySelector('mediaCount')?.textContent,
          author      : entry.querySelector('author')?.textContent,
          publisher   : entry.querySelector('publisher')?.textContent,

          //todo: get user | admin topic rating.
          rating  : 3,
          progress: 40,

          //process topic links.
          links: Array.from(entry.querySelectorAll('link'))
                      .map(link => ({
                        href: link.getAttribute('href'),
                        rel : link.getAttribute('rel'),
                        type: link.getAttribute('type')
                      }))

        }));

        //loading stop.

      }
          //fetch error.
      catch (e) {
        //loading stop.
        this.is_loading = false;

        //notify.
        this.notify('Loading Error', 'Sorry, unable to load topics.', 'warn');
      }

    },


    //viewEntry.
    async viewEntry(entry) {
      //set active entry.
      this.entry = entry;

      //set loading progress.
      this.is_loading = true;
      setTimeout(() => {
        this.is_loading = false
      }, 4000);


      //update session.
      const session = useState('session').value;
      if (!session.data) return; // exit if admin.

      //session data init.
      let session_data = session.data;
      if (!session_data.entries) session_data.entries = {};


      //entry data init
      if (!session_data.entries[entry.title]) {
        session_data.entries[entry.title] = {
          name              : entry.title,
          views             : 1,
          rating            : 3,
          progress          : 10,
          session_total_time: 0,
          start_time        : new Date().getTime()
        };
      }

      //entry data update.
      else {
        session_data.entries[entry.title].views++;
      }

      //save session.
      this.saveSession();
    }, //viewEntry.

    //closeEntry.
    async closeEntry() {
      //get session.
      const session = useState('session').value;

      //save session.
      if (session.data) {
        //time init.
        const start_time = session.data.entries[this.entry.title].start_time;
        const end_time   = new Date().getTime();

        //compute end time.
        session.data.entries[this.entry.title].session_total_time += (end_time - start_time);

        //save session
        await this.saveSession();
      }

      //close current entry.
      this.entry = null;
    },


    //save session.
    async saveSession() {
      //session update.
      const session_data    = useState('session').value.data;
      session_data.end_time = new Date().getTime();

      //save session.
      try {
        await $fetch(this.server_url + 'sessions', {
          method: 'POST',
          body  : JSON.stringify(session_data)
        });
      }

          //client error.
      catch (e) {
        this.notify('session update error', 'Sorry, unable to update session', 'warn');
      }
    },

    //notify.
    notify(title, details, severity) {
      this.$toast.add({
        severity: severity || 'info',
        summary : title || 'Update',
        detail  : details || 'Successful',
        life    : 2000
      });
    },
  },

  async mounted() {
    //fetch topics.
    await this.getEntries();
  }

})
</script>


<style>
.p-progressbar-value {
  background-color: #00ff00;
}

a {
  text-decoration: none !important;
}
</style>