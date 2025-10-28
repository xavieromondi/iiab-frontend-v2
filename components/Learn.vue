<template>
  <div class="grid m-0 px-3 py-5 bg=green-600 bg-cover bg-center h-screen"
       style="background: url('bg-1.png')">

    <!-- user navbar -->
    <nav
        class="col-12 align-self-start fadein animation-duration-500 flex align-items-center justify-content-between text-white select-none">

      <!-- avatar | menu -->
      <div>
        <Button class="mr-2"
                icon="pi pi-user" rounded raised
                severity="secondary"
                size=""/>
        <Badge :value="useState('session').value.class_.name"
               class="capitalize" severity="success" size=""/>
      </div>
      <!-- /avatar | menu -->

      <!-- menu -->
      <div class="flex align-items-center justify-content-end gap-3">
        <!-- zims -->
        <Button :outlined="content_provider !== 'zims'"
                class="border-none font-bold"
                rounded severity="help" raised
                @click="useState('content_provider').value = 'zims'">
          <i class="pi pi-book"/>
          <span class="hidden md:flex">General Study</span>
        </Button>
        <!-- /zims -->

        <!-- msingi_pack -->
        <Button :outlined="content_provider !== 'msingi_pack'"
                class="font-bold border-none"
                severity="success" rounded raised
                @click="fetchMsingiPackContent()">
          <i class="pi pi-book"/>
          <span class="hidden md:flex">Msingi Pack</span>
        </Button>
        <!-- /msingi_pack -->

        <!-- logout -->
        <Button :loading="logging_out" rounded class="text-red-600 font-bold"
                severity="secondary" raised
                icon="pi pi-power-off"
                @click="logout"/>
        <!-- /logout -->
      </div>
      <!-- /menu -->

    </nav>
    <!-- /user navbar -->

    <!-- zims -->
    <template v-if="content_provider === 'zims'">

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
          <div v-else id="content-div" class="h-30rem bg-white flex flex-column"
               :style="full_screen? {height: '90vh' } : {} ">

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
        <div v-if="entries.length" class="col-12 px-4 pt-3 flex justify-content-end">
          <Button
              class="h-2rem w-4rem border-noround shadow-1 border-none border-noround border-round-left-2xl"
              :disabled="!start"
              severity="help" raised
              icon="pi pi-angle-left" @click="getPreviousEntries"/>

          <Button class="h-2rem w-4rem border-noround shadow-1 border-none"
                  severity="help" raised
                  :loading="is_loading" icon="pi pi-refresh" @click="getEntries()"/>

          <Button
              class="h-2rem w-4rem border-noround shadow-1 border-none border-noround border-round-right-2xl text-sm"
              :disabled="!next"
              severity="help" raised
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

            <Zim-card
                :title_="entry_.title"
                :rating_="entry_.rating || 0"
                :progress_="entry_.progress || 0"
                :thumbnail_="`${kiwix_url}${entry_.links[0].href}`"/>

          </div>
        </template>
        <!-- /entries -->

      </template>
      <!-- entries grid -->

    </template>
    <!-- /zims -->


    <!-- msingi pack content -->
    <template v-if="content_provider === 'msingi_pack'">

      <!-- msingi subjects -->
      <template v-if="mp_content">
        <!-- header -->
        <div class="col-12 py-0 flex justify-content-between align-items-center">

          <div class="flex align-items-center gap-3">
            <Button :label="mp_grade" severity="success" raised
                    class="border-none font-bold" rounded/>
            <Button v-if="subject"
                    severity="success"
                    :label="subject.title" raised
                    icon="pi pi-times"
                    @click="subject=null"
                    class="border-none font-bold" rounded/>
          </div>

          <Button class="border-none hover:shadow-3 hover:bg-green-500"
                  icon="pi pi-times"
                  icon-pos="right" label="Close" raised rounded
                  severity="success"
                  @click="closeSubject()"/>
        </div>
        <!-- /header -->


        <!-- msingi subject iframe -->
        <div v-if="subject" class="col-12">

          <!-- loading progress -->
          <div v-if="subject_is_loading" class="h-15-rem text-center fadein animation-duration-1000">
            <ProgressSpinner/>
          </div>
          <!-- /loading progress -->


          <!-- subject iframe -->
          <iframe v-else-if="subject.available" class="w-full md:h-25rem border-none fadein animation-duration-1000"
                  :src="msingi_url+subject.link">
          </iframe>
          <!-- /subject iframe -->


          <!-- subject content not available -->
          <div v-else class="h-15rem text-center fadein animation-duration-1000 text-3xl text-orange-400">
            Sorry, content not available.
          </div>
          <!-- /subject content not available -->

        </div>
        <!-- /msingi subject iframe -->


        <!-- msingi subject cards -->
        <template v-else>
          <div v-for="subject_ in mp_content.subjects"
               class="col-12 md:col-6 lg:col-4 fadein animation-duration-500 select-none">
            <subject-card :link_="subject_.link"
                          :subject="subject_"
                          :title_="subject_.title"
                          @click="loadMsingiSubject(subject_)"/>
          </div>
        </template>
        <!-- /msingi subject cards -->
      </template>
      <!-- /msingi subjects -->


      <!-- msingi grade list -->
      <template v-else>
        <div v-for="(content_, grade) in msingi_content" class="md:col-6 lg:col-3">
          <div
              class="w-full h-5rem p-3 border-3 border-white fadein animation-duration-500 shadow-2 hover:shadow-4 border-round-xl overflow-hidden bg-green-600 hover:bg-green-500  text-white flex align-items-center justify-content-between"
              @click="mp_content=content_; mp_grade=grade">
            <div class="font-bold">{{ grade }}</div>
            <div class="flex align-items-center">
              <badge :value="content_.subjects.length"
                     class="w-2rem border-round-xl bg-white font-bold text-purple-700 shadow-2"/>
              <i class="pi pi-angle-right text-2xl"/>
            </div>
          </div>
        </div>
      </template>
      <!-- /msingi pack -->
    </template>
    <!-- /msingi pack content -->

  </div>
</template>


<script lang="js">
export default defineComponent({

  props: ['close'],

  name: "Subjects",

  data() {
    return {
      //msingi pack.
      msingi_content    : {},
      mp_grade          : null,
      mp_content        : null,
      subject           : null,
      subject_is_loading: false,

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

  computed: {
    server_url() {
      return useState('server_url').value;
    },
    kiwix_url() {
      return useState('kiwix_url').value;
    },
    msingi_url() {
      return useState('msingi_url').value;
    },
    content_provider() {
      return useState('content_provider').value;
    }
  },

  watch: {
    //close entry view.
    close(newVal, oldVal) {
      this.closeEntry()
    },

    //content provider switch.
    content_provider(newVal, oldVal) {
      if (newVal === 'zims' && !this.entries.length) this.getEntries();
    }
  },

  methods: {
/////////////////////////////////////////// SESSION MANAGEMENT.
    //update session item view.
    async updateItemView(item_name) {
      if (!item_name) return;

      //update session.
      const session = useState('session').value;
      if (!session.data) return; // exit if no data.

      //session data init.
      let session_data = session.data;
      if (!session_data.entries) session_data.entries = {};

      //entry data init
      if (!session_data.entries[item_name]) {
        session_data.entries[item_name] = {
          name              : item_name,
          views             : 1,
          rating            : 3,
          session_total_time: 0,
          start_time        : new Date().getTime()
        };
      }

      //entry data update.
      else {
        session_data.entries[item_name].views++;
      }

      //save session.
      await this.saveSession();
    },

    //close item view.
    async closeItem(item_name) {
      //get session.
      const session = useState('session').value;

      //save session.
      if (session.data) {
        //time init.
        const start_time = session.data.entries[item_name].start_time;
        const end_time   = new Date().getTime();

        //compute end time.
        session.data.entries[item_name].session_total_time += (end_time - start_time);

        //save session
        await this.saveSession();
      }
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
/////////////////////////////////////////// SESSION MANAGEMENT.


//////////////////////////////////////////// MSINGI PACK CONTROLS.
    //load msingi_pack subject content.
    async loadMsingiSubject(subject) {
      //missing subject.
      if (!subject.available) {
        this.notify(subject.title + ' not available', 'Please try again later', 'warn');
        return;
      }

      //set active subject.
      this.subject = subject;
      await this.updateItemView(subject.title);
    },

    //fetch msingi content.
    async fetchMsingiPackContent() {
      //set msingi pack content provider.
      useState('content_provider').value = 'msingi_pack';

      try {
        // Fetch the HTML file
        this.is_loading = true;
        const html      = await $fetch(this.msingi_url, {responseType: 'text'});
        this.is_loading = false;

        // Parse content.
        const parser = new DOMParser();
        const doc    = parser.parseFromString(html, "text/html");

        // Prepare data.
        const data    = {};
        const headers = doc.querySelectorAll(".listhead");

        for (const header of headers) {
          const gradeName = header.textContent.trim();
          const ul        = header.nextElementSibling;
          if (!ul) continue;

          const subjects          = [];
          const subject_link_tags = ul.querySelectorAll("a");

          for (const subject_link_tag of subject_link_tags) {

            const subject_link = subject_link_tag.getAttribute("href");

            subjects.push({
              title: subject_link_tag.textContent.trim(),
              link : subject_link.replace(/^\/?modules\/en-wL_Msingi\//, ''),
            });

          }

          data[gradeName] = {subjects};
        }

        return data;
      }
      catch (e) {
        this.notify('Server offline', 'unable to get Msingi content', 'warn');
        this.is_loading = false;
      }
    },

    //close subject.
    async closeSubject() {
      //update session item close.
      await this.closeItem(this.subject.title);

      //reset subject | content.
      this.mp_content = null;
      this.subject    = null;
    },
//////////////////////////////////////////// MSINGI PACK CONTROLS.


/////////////////////////////////////////// ITEM VIEW CONTROLS.
    //view entry full screen.
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
      this.full_screen = false;
      document.exitFullscreen();
    },
/////////////////////////////////////////// ITEM VIEW CONTROLS.


/////////////////////////////////////////// ZIM ENTRY CONTROLS.
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
        //loading stop | notify.
        this.is_loading = false;
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
      await this.saveSession();
    }, //viewEntry.

    //closeEntry.
    async closeEntry() {
      //close item view.
      await this.closeItem(this.entry.title);

      //close current entry.
      this.entry = null;
    },
/////////////////////////////////////////// ZIM ENTRY CONTROLS.


/////////////////////////////////////////// GLOBAL CONTROLS.
    //notify.
    notify(title, details, severity) {
      this.$toast.add({
        severity: severity || 'info',
        summary : title || 'Update',
        detail  : details || 'Successful',
        life    : 2000
      });
    },

    //logout.
    async logout() {
      //save session.
      if (useState('session').value) {
        this.logging_out = true;
        if (useState('session').value) await this.saveSession();
        this.logging_out = false;
      }

      //logout | update UI.
      useState('logout').value = 1;
      useState('admin').value  = null;
      useState('ui').value     = "login";
    },
/////////////////////////////////////////// GLOBAL CONTROLS.
  },

  async mounted() {
    //fetch topics.
    //await this.getEntries();

    //fetch Msingi pack.
    this.msingi_content = await this.fetchMsingiPackContent();
  }

})
</script>


<style scoped>
.p-progressbar-value {
  background-color: #00ff00;
}

a {
  text-decoration: none !important;
}

</style>