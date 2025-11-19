<template>
  <!-- entry -->
  <div v-if="entry" class="col-12 fadein animation-duration-1000">

    <!-- header -->
    <div
        class="md:h-3rem border-1 border-gray-200 flex align-items-center justify-content-between bg-purple-600 text-white">

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
          class="hidden md:flex h-full w-7rem md:w-12rem border-noround border-none font-bold"
          icon="pi pi-expand"
          severity="help" raised
          label="Maximize"
          icon-pos="right"
          @click="fullScreen"/>

      <!-- close entry -->
      <Button class="hidden md:flex h-full w-8rem md:w-10rem border-noround border-none"
              icon="pi pi-times"
              severity="help" raised
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
      <div v-else id="content-div"
           :style="full_screen? {height: '90vh' } : {} "
           class="h-30rem bg-white flex flex-column">

        <div v-if="full_screen" class="absolute opacity-80"
             :style="{ height: '5vh', top: '1rem', right: '1rem' }">
          <!-- exit full screen -->
          <Button
              class="w-10rem bg-orange-600 border-none"
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
                icon-pos="right"
                label="Close"
                @click="closeEntry"/>
      </div>
    </div>
    <!-- content -->

  </div>
  <!-- entry -->

  <!-- entries grid -->
  <template v-else>

    <!-- controls -->
    <div v-if="entries.length" class="col-12 px-3 pt-4 flex justify-content-end">
      <Button :disabled="!start"
              class="h-2rem w-4rem border-noround shadow-1 border-none border-noround border-round-left-2xl"
              icon="pi pi-angle-left" raised
              severity="help" @click="getPreviousEntries"/>

      <Button :loading="is_loading"
              class="h-2rem w-4rem border-noround shadow-1 border-none"
              icon="pi pi-refresh" raised
              severity="help" @click="getEntries()"/>

      <Button :disabled="!next"
              class="h-2rem w-4rem border-noround shadow-1 border-none border-noround border-round-right-2xl text-sm"
              icon="pi pi-angle-right" raised
              severity="help" @click="getNextEntries"/>
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
           :class="`col-12 md:col-6 lg:col-4 px-3 bg-white flipleft animation-duration-${ ix*200 } animation-ease-in select-none cursor-pointer text-white`"
           @click="viewEntry(entry_)">

        <Zim-card :progress_="entry_.progress || 0"
                  :rating_="entry_.rating || 0"
                  :thumbnail_="`${kiwix_url}${entry_.links[0].href}`"
                  :title_="entry_.title"/>

      </div>
    </template>
    <!-- /entries -->

  </template>
  <!-- entries grid -->
</template>


<script lang="js">
import {useUpdateSubjectSession} from "~/composables/useUpdateSubjectSession.js";

export default defineComponent({
  name : "Zims",
  props: ['close'],

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
      full_screen: false,
      logging_out: false
    }
  },

  watch: {
    //close entry view.
    close(newVal, oldVal) {
      this.closeEntry()
    },
  },

  computed: {
    kiwix_url() {
      return useState('kiwix_url').value;
    },
  },

  methods: {
    /////////////////////////////////////////// ITEM VIEW CONTROLS.

    //view full screen.
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

    //exit full screen.
    exitFullScreen() {
      document.exitFullscreen();
      this.full_screen = false;
    },

/////////////////////////////////////////// ITEM VIEW CONTROLS.


/////////////////////////////////////////// ZIM ENTRY CONTROLS.

    //fetch previous entries.
    getPreviousEntries() {
      if (!this.start) return;

      this.start = this.start - 9;
      this.getEntries('prev');
    },

    //getNext.
    async getNextEntries() {
      this.start = this.start + 9;
      await this.getEntries();
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
      }
      catch (e) { //fetch error.
        this.is_loading = false;
        this.fetchError();
      }
    },

    //viewEntry.
    async viewEntry(entry) {
      if (!entry) return;

      //set active entry.
      this.entry = entry;

      //set loading progress.
      this.is_loading = true;
      setTimeout(() => {
        this.is_loading = false
      }, 4000);

      //update session.
      await useUpdateSubjectSession(entry.title)
    }, //viewEntry.

    //closeEntry.
    async closeEntry() {
      if (!this.entry) return;

      //update session.
      await useUpdateSubjectSession(this.entry.title);

      //close current entry.
      this.entry = null;
    },

/////////////////////////////////////////// ZIM ENTRY CONTROLS.


/////////////////////////////////////////// NOTIFICATIONS.

    //notify.
    notify(title, details, severity) {
      this.$toast.add({
        severity: severity || 'info',
        summary : title || 'Update',
        detail  : details || 'Successful',
        life    : 2000
      });
    },

    //notify error.
    fetchError() {
      this.$toast.add({
        severity: "warn",
        summary : "Error",
        detail  : "Sorry server offline",
        life    : 2000
      });
    },

/////////////////////////////////////////// NOTIFICATIONS.

  },

  mounted() {
    this.getEntries();
  }
})
</script>