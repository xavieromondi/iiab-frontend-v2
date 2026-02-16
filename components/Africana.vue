<template>

  <!-- africana header -->
  <div v-if="grade" class="col-12 pt-3 px-4">
    <div class="flex justify-content-between align-items-center shadow-2 border-round-3xl overflow-hidden">

      <!-- title bar -->
      <div>
        <Button label="Grades"
                severity="success"
                style="clip-path: polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)"/>

        <Button class="bg-transparent text-gray-800 text-lg border-none" :label="grade.name"/>

        <Button v-if="subject"
                class="h-full px-5 border-none"
                severity="success"
                icon="pi pi-times"
                icon-pos="right"
                :label="subject.name"
                :loading="is_loading==='closeSubject'"
                style="clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 5% 50%)"
                @click="closeSubject"/>
      </div>
      <!-- title bar -->


      <!-- controls -->
      <div>
        <!-- refresh -->
        <Button v-if="!subject"
                :loading="is_loading==='getStudies'"
                class="border-noround"
                icon="pi pi-refresh"
                icon-pos="right"
                label="refresh"
                severity="success"
                @click="getStudies"/>

        <!-- view full screen -->
        <Button v-if="subject"
                class="border-noround"
                icon="pi pi-expand"
                icon-pos="right"
                label="Maximize"
                severity="success"
                @click="viewFullScreen"/>

        <!-- close grade -->
        <Button class="border-noround border-round-right-3xl"
                icon="pi pi-times"
                icon-pos="right"
                label="close"
                severity="warn"
                :loading="is_loading==='closeGrade'"
                @click="closeGrade"/>
      </div>
      <!-- /controls -->

    </div>
  </div>
  <!-- /africana header -->


  <!-- africana subject iframe -->
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
          :src="africana_url + subject.link"
          style="height: 80vh"
          @load="is_loading=false">
      </iframe>
    </div>
    <!-- /subject iframe -->
  </div>
  <!-- /africana subject iframe -->


  <!-- africana grade -->
  <div v-else-if="grade" class="col-12 p-0">
    <div class="grid m-0 px-3">
      <div v-for="subject_ in grade.subjects"
           class="col-12 md:col-6 lg:col-4 fadein animation-duration-500 select-none">
        <subject-card :link_="africana_url+subject_.link"
                      :subject="subject_"
                      :title_="subject_.name"
                      @click="loadSubject(subject_)"/>
      </div>
    </div>
  </div>
  <!-- /africana grade -->


  <!-- africana grade list -->
  <div v-else class="col-12 md:p-4">
    <div class="grid m-0">
      <div v-for="grade_ in studies" class="col-6 md:col-4">
        <div
            class="w-full h-5rem p-3 border-3 border-white fadein animation-duration-500 shadow-2 hover:shadow-4 border-round-xl overflow-hidden bg-green-600 hover:bg-green-500  text-white flex align-items-center justify-content-between"
            @click="viewGrade(grade_)">
          <div class="font-bold">{{ grade_.name }}</div>
          <div class="flex align-items-center">
            <badge :value="grade_.subjects.length"
                   class="w-2rem border-round-xl bg-white font-bold text-purple-700 shadow-2"/>
            <i class="pi pi-angle-right text-2xl"/>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /africana grade list -->

</template>


<script lang="js">
import {useUpdateSubjectSession} from "~/composables/useUpdateSubjectSession.js";

export default defineComponent({

  name: "Africana",

  data() {
    return {
      studies    : [],
      grade      : null,
      subject    : null,
      full_screen: false,
      is_loading : false,
    }
  },

  computed: {
    africana_url() {
      return useState('africana_url').value;
    }
  },

  methods: {

/////////////////////////////////// SUBJECT CONTROLS.

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

    //load subject.
    async loadSubject(subject) {
      //missing subject.
      if (!subject.available) {
        this.notify(subject.name + ' not available', 'Please try again later', 'warn');
        return;
      }

      //set active subject.
      this.is_loading = true;
      this.subject    = subject;
      this.updateUrl({
        provider: 'africana',
        grade   : this.grade?.name || null,
        subject : subject.name,
        link    : subject.link
      });
      await useUpdateSubjectSession(subject.name);
    },


    //close subject view.
    async closeSubject() {
      //update session.
      this.is_loading = "closeSubject";
      await useUpdateSubjectSession(this.subject.name);
      this.is_loading = false;

      //close subject.
      this.subject     = null;
      this.full_screen = false;
      this.updateUrl({
        provider: 'africana',
        grade   : this.grade?.name || null,
        subject : null,
        link    : null
      });
    },

/////////////////////////////////// SUBJECT CONTROLS.


/////////////////////////////////// STUDIES CONTROLS.

    //view grade.
    async viewGrade(grade) {
      this.grade = grade;
      this.updateUrl({
        provider: 'africana',
        grade   : grade?.name || null,
        subject : null,
        link    : null
      });
    },

    //get africana studies.
    async getStudies() {
      try {
        //get raw html.
        this.is_loading = 'getStudies';
        const html      = await $fetch(this.africana_url, {responseType: 'text'});
        this.is_loading = false;

        //parse content.
        const parser   = new DOMParser();
        const doc      = parser.parseFromString(html, 'text/html');
        const sections = Array.from(doc.querySelectorAll("main section"));

        //set studies.
        this.studies = sections.map(section => {
          //get grade.
          const gradeName = section.querySelector("h3")?.innerText.trim() || "";
          const subjects  = Array.from(section.querySelectorAll("ul li a")).map(a => ({
            name: a.innerText.trim(),
            link: a.getAttribute("href") || ""
          }));

          //return grade info.
          return {
            name    : gradeName,
            subjects: subjects
          };
        });
      }
      catch (e) {
        this.notify('Server Error.', 'Sorry, unable to fetch files.', 'warn');
        this.is_loading = false;
      }
    },

    //close grade view.
    async closeGrade() {
      //close grade.
      this.grade = null;

      //update subject tracking.
      this.is_loading = "closeGrade";
      if (this.subject) await useUpdateSubjectSession(this.subject.name);
      this.is_loading = false;

      //close subject | reset UI.
      this.subject     = null;
      this.full_screen = false;
      this.updateUrl({
        provider: 'africana',
        grade   : null,
        subject : null,
        link    : null
      });
    },

/////////////////////////////////// STUDIES CONTROLS.


/////////////////////////////////// GLOBAL CONTROLS.

    //notify popup.
    notify(title, details, severity) {
      this.$toast.add({
        severity: severity || 'info',
        summary : title || 'Update',
        detail  : details || 'Successful',
        life    : 2000
      });
    },

/////////////////////////////////// GLOBAL CONTROLS.


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
  },

  mounted() {
    this.getStudies().then(async () => {
      const q = this.$route?.query || {};
      if (q.provider === 'africana' && this.studies && this.studies.length) {
        const matchName = (a, b) => a && b && a.trim().toLowerCase() === b.trim().toLowerCase();
        const grade = q.grade ? this.studies.find(g => matchName(g.name, q.grade)) : null;
        if (grade) {
          this.grade = grade;
          if (q.link || q.subject) {
            const subject_ = (grade.subjects || []).find(s => (q.link && s.link === q.link) || (q.subject && matchName(s.name, q.subject)));
            if (subject_) this.loadSubject(subject_);
          }
        }
      }
    });
  }
})
</script>
