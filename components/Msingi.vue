<template>
  <div class="col-12">

    <!-- header -->
    <div v-if="mp_grade" class="pt-3 px-2">
      <div class="flex justify-content-between align-items-center shadow-2 border-round-3xl overflow-hidden">

        <div>
          <Button label="Grades"
                  severity="success"
                  style="clip-path: polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)"/>

          <Button :label="mp_grade" class="bg-transparent text-gray-800 text-lg border-none"/>

          <Button v-if="subject"
                  class="h-full px-5 border-none"
                  severity="success"
                  icon="pi pi-times"
                  icon-pos="right"
                  :label="subject.title"
                  :loading="is_loading==='closeSubject'"
                  style="clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 5% 50%)"
                  @click="closeSubject"/>
        </div>

        <div>
          <Button v-if="subject"
                  class="border-noround"
                  icon="pi pi-expand"
                  icon-pos="right"
                  label="Maximize"
                  severity="success"
                  @click="viewFullScreen"/>
          <Button class="border-noround border-round-right-3xl"
                  icon="pi pi-times"
                  icon-pos="right"
                  label="close"
                  severity="warn"
                  @click="closeGrade"/>
        </div>

      </div>
    </div>
    <!-- /header -->


    <!-- content -->
    <div class="grid m-0 relative">

      <!-- msingi subject iframe -->
      <div v-if="subject" class="col-12">

        <!-- subject iframe -->
        <div id="iframe-box" class="relative">

          <!-- Loading overlay -->
          <div v-if="is_loading" class="flex items-center justify-center absolute z-4">
            <ProgressSpinner/>
          </div>

          <div v-if="full_screen"
               style="height: 5vh; top: 1rem; right: 1rem"
               class="absolute opacity-80 z-3">
            <!-- exit full screen -->
            <Button
                class="bg-orange-500 border-none"
                icon="pi pi-times"
                icon-pos="right"
                label="Exit Fullscreen" raised rounded
                @click="exitFullScreen"/>
          </div>

          <iframe
              :class="'w-full relative shadow-3 border-none fadein animation-duration-1000 ' + (full_screen ? 'h-screen' : '')"
              :src="msingi_url+subject.link"
              style="height: 80vh"
              @load="is_loading=false">
          </iframe>
        </div>
        <!-- /subject iframe -->

      </div>
      <!-- /msingi subject iframe -->


      <!-- msingi subject cards -->
      <template v-else-if="msingi_grade_subjects">
        <div v-for="subject_ in msingi_grade_subjects"
             class="col-12 md:col-6 lg:col-4 fadein animation-duration-500 select-none">
          <subject-card :link_="msingi_url+subject_.link"
                        :subject="subject_"
                        :title_="subject_.title"
                        @click="loadMsingiSubject(subject_)"/>
        </div>
      </template>
      <!-- /msingi subject cards -->


      <!-- msingi grade list -->
      <template v-else>
        <div v-for="(content_, grade) in msingi_grade_list" class="col-6 lg:col-4">
          <div
              class="w-full h-5rem p-3 border-3 border-white fadein animation-duration-500 shadow-2 hover:shadow-4 border-round-xl overflow-hidden bg-green-600 hover:bg-green-500  text-white flex align-items-center justify-content-between"
              @click="viewGradeSubjects(grade, content_)">
            <div class="font-bold">{{ grade }}</div>
            <div class="flex align-items-center">
              <badge :value="content_.subjects.length"
                     class="w-2rem border-round-xl bg-white font-bold text-purple-700 shadow-2"/>
              <i class="pi pi-angle-right text-2xl"/>
            </div>
          </div>
        </div>
      </template>
      <!-- msingi grade list -->

    </div>
    <!-- /content -->

  </div>
</template>


<script lang="js">
import {useUpdateSubjectSession} from "~/composables/useUpdateSubjectSession.js";

export default defineComponent({
  name: "Msingi",

  data() {
    return {
      //view vars.
      full_screen: false,
      is_loading : false,

      //grade | subject.
      mp_grade: null,
      subject : null,

      //content.
      msingi_grade_list    : null,
      msingi_grade_subjects: null,
    }
  },

  computed: {
    msingi_url() {
      return useState('msingi_url').value;
    },
    server_url() {
      return useState('server_url').value;
    },
  },

  methods: {
//////////////////////////////////////////// MSINGI PACK CONTROLS.
    //update url query.
    updateUrl(params) {
      if (!this.$router || !this.$route) return;
      const query = {...this.$route.query};
      Object.keys(params).forEach(key => {
        const val = params[key];
        if (val === null || val === undefined || val === '') delete query[key];
        else query[key] = val;
      });
      this.$router.replace({query});
    },


    //load msingi_pack subject content.
    async loadMsingiSubject(subject) {
      //missing subject.
      if (!subject.available) {
        this.notify(subject.title + ' not available', 'Please try again later', 'warn');
        return;
      }

      //set active subject.
      this.is_loading = true;
      this.subject    = subject;
      this.updateUrl({
        provider: 'msingi',
        grade   : this.mp_grade,
        subject : subject.title,
        link    : subject.link
      });
      await useUpdateSubjectSession(subject.title);
    },

    //fetch msingi content.
    async fetchMsingiPackContent() {
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

        //return.
        return data;
      }
      catch (e) {
        this.fetchError();
        this.is_loading = false;
      }
    },

    //view grade subjects.
    viewGradeSubjects(grade, content_) {
      this.msingi_grade_subjects = content_.subjects;
      this.mp_grade              = grade;
      this.updateUrl({
        provider: 'msingi',
        grade   : grade,
        subject : null,
        link    : null
      });
    },

    //close grade view.
    async closeGrade() {
      //update subject tracking.
      if (this.subject) await useUpdateSubjectSession(this.subject.title);

      //reset UI.
      this.subject               = null;
      this.msingi_grade_subjects = null;
      this.mp_grade              = null;
      this.full_screen           = false;
      this.updateUrl({
        provider: 'msingi',
        grade   : null,
        subject : null,
        link    : null
      });
    },

    //close subject.
    async closeSubject() {
      //update session.
      this.is_loading = "closeSubject";
      await useUpdateSubjectSession(this.subject.title);
      this.is_loading = false;

      //close subject.
      this.subject     = null;
      this.full_screen = false;
      this.updateUrl({
        provider: 'msingi',
        grade   : this.mp_grade,
        subject : null,
        link    : null
      });
    },

//////////////////////////////////////////// MSINGI PACK CONTROLS.


//////////////////////////////////////////// VIEW CONTROLS.

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

//////////////////////////////////////////// VIEW CONTROLS.


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

  async mounted() {
    //fetch Msingi pack.
    this.msingi_grade_list = await this.fetchMsingiPackContent();

    const q = this.$route?.query || {};
    if (q.provider === 'msingi' && q.grade && this.msingi_grade_list && this.msingi_grade_list[q.grade]) {
      const content_ = this.msingi_grade_list[q.grade];
      this.viewGradeSubjects(q.grade, content_);

      if (q.link || q.subject) {
        const subject_ = (content_.subjects || []).find(s => (q.link && s.link === q.link) || (q.subject && s.title === q.subject));
        if (subject_) await this.loadMsingiSubject(subject_);
      }
    }
  }
});
</script>


<style scoped>

</style>
