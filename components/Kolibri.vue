<template>
  <div class="col-12 p-3 select-text">

    <!-- header -->
    <div
        class="flex justify-content-between align-items-center border-1 border-gray-200 border-noround overflow-hidden">
      <div class="flex align-items-center gap-3">
        <Button class="h-full w-4rem border-noround w-9rem bg-gray-200 border-none"
                label="Kolibri"
                style="clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)">
          <img src="/kolibri.svg" class="w-3rem" alt="kolibri"/>
        </Button>
        <span class="font-bold" v-if="channel">{{ channel.name }}</span>
      </div>
      <div>
        <Button class="border-noround"
                icon="pi pi-refresh"
                icon-pos="right"
                label="Refresh"
                :loading="is_loading"
                severity="primary"
                @click="getChannels"/>
        <Button class="border-noround"
                icon="pi pi-expand"
                icon-pos="right"
                label="Maximize"
                severity="primary"
                @click="goFullScreen('iframe-box')"/>
        <Button v-if="channel"
                class="border-noround"
                icon="pi pi-times"
                icon-pos="right"
                label="Close"
                severity="warn"
                @click="closeView"/>
      </div>
    </div>
    <!-- /header -->


    <!-- Kolibri box -->
    <div id="iframe-box"
         class="grid m-0 relative bg-white border-1 brder-top-none border-gray-300">

      <!-- topic -->
      <div v-if="topic" class="col-12 p-0 fadein animation-duration-1000">
        <div class="shadow-1 border-1 border-top-none border-gray-200">
          <!-- topic header -->
          <div class="p-3 flex align-items-center justify-content-between  border-1 border-gray-200">

            <div class="flex align-items-center gap-3">
              <img v-if="topic_thumbnail_url"
                   :src="kolibri_url+topic_thumbnail_url"
                   class="h-3rem border-round border-1 border-white"/>
              <h3 class="m-0">{{ topic.title }}</h3>
            </div>

            <div>
              <Button icon="pi pi-times"
                      icon-pos="right"
                      label="Close" raised rounded
                      severity="secondary"
                      size="small"
                      @click="closeTopic()"/>
            </div>
          </div>
          <!-- /topic header -->

          <div class="p-3">
            {{ topic.description }}
          </div>

          <!-- files -->
          <div v-if="topic.files.length" class="grid m-0">
            <div v-for="file in topic.files.filter(file_ => file_.storage_url.includes('pdf'))"
                 class="col-12 md:col-3">
              <div :id="file.id" class="p-3 relative shadow-1 border-round border-1 border-gray-200">

                <div v-if="full_screen" style="width: 100vw" class="absolute pt-4 pr-8 text-right">
                  <Button icon="pi pi-times"
                          @click="exitFullScreen"
                          label="Exit Full screen"
                          class="opacity-80 hover:shadow-3"
                          severity="success" raised rounded/>
                </div>

                <iframe
                    allowfullscreen
                    class="h-full w-full"
                    :src="kolibri_url+file.storage_url">
                </iframe>
                <div>

                  <Button icon="pi pi-expand"
                          @click="goFullScreen(file.id)"
                          severity="success" raised rounded/>
                </div>
              </div>
            </div>
          </div>
          <!-- /files -->
        </div>
      </div>
      <!-- /topic -->


      <!-- topics -->
      <template v-if="topics.length">
        <div v-for="topic in topics" class="col-12 md:col-4 lg:col-3 py-4">
          <div class="p-4 border-1 border-gray-300 shadow-1">
            <!-- thumbnail -->
            <div>
              <img v-if="getTopicThumbnailUrl(topic)"
                   :alt="topic.title"
                   :src="kolibri_url+getTopicThumbnailUrl(topic)"
                   class="w-full shadow-1 border-round"/>
            </div>
            <!-- /thumbnail -->

            <!-- title -->
            <h3 class="m-0 text-center">
              {{ topic.title || topic.name }}
            </h3>
            <!-- title -->

            <!-- CTA -->
            <div class="pt-3 text-center">
              <Button :loading="is_loading"
                      class="w-full"
                      icon="pi pi-angle-right"
                      icon-pos="right" size="small"
                      label="Learn" raised rounded
                      severity="success"
                      @click="viewTopic(topic)"/>
            </div>
            <!-- /CTA -->
          </div>
        </div>
      </template>
      <!-- /topics -->


      <!-- channels -->
      <template v-else-if="!topic">
        <div v-for="channel_ in channels" class="col-12 md:col-4"
             @click="getChannelTopics(channel_)">
          <div
              class="md:h-6rem lg:h-9rem p-2 border-white border-3 bg-purple-600 flex justify-content-between cursor-pointer border-round-2xl overflow-hidden shadow-1 hover:shadow-6">

            <!-- title | name -->
            <div class="w-9 p-3 text-xl text-white font-bold">
              {{ channel_.title || channel_.name }}
            </div>
            <!-- title | name -->

            <!-- thumbnail -->
            <img :alt="channel_.description"
                 :src="useThumbnail(channel_.description)"
                 class="w-6 h-full border-round border-1 border-white shadow-2"/>
            <!-- /thumbnail -->

          </div>
        </div>
      </template>
      <!-- /channels -->


      <!-- Loading overlay -->
      <div v-if="is_loading" class="flex items-center justify-center fadein animation-duration-1000">
        <ProgressSpinner/>
      </div>
      <!-- /Loading overlay -->


      <!-- full_screen exit -->
      <div v-if="full_screen" class="absolute opacity-80 z-3"
           :style="{ height: '5vh', top: '1rem', right: '1rem' }">
        <!-- exit full screen -->
        <Button
            class="bg-orange-500 border-none"
            icon="pi pi-times"
            icon-pos="right"
            label="Exit Fullscreen" raised rounded
            @click="exitFullScreen"/>
      </div>
      <!-- /full_screen exit -->

    </div>
    <!-- /Kolibri iframe -->

  </div>
</template>


<script lang="js">
import {useUpdateSubjectSession} from "~/composables/useUpdateSubjectSession.js";

export default defineComponent({
  name: "Kolibri",

  data() {
    return {
      //view vars.
      is_loading : true,
      full_screen: false,

      //channels.
      channels: [],
      channel : null,

      //article
      topic        : null,
      viewed_topics: {},

      //UI.
      grid_mode: true
    }
  },

  computed: {
    //topics.
    topics() {
      if (this.topic) return this.topic.topics || [];
      else if (this.channel && this.channel.topics) return this.channel.topics;
      else return [];
    },

    //topic thumbnail.
    topic_thumbnail_url() {
      if (!this.topic || !this.topic.files) return null;

      const thumbnail = this.topic.files.find(file => file.preset === 'topic_thumbnail');
      if (thumbnail) return thumbnail.storage_url;
      else return null;
    },

    //server_url.
    server_url() {
      return useState('server_url').value;
    },

    //kolibri.
    kolibri_url() {
      return useState('kolibri_url').value;
    },
    kolibri_channel_url() {
      return useState('kolibri_channel_url').value;
    },
    kolibri_content_url() {
      return useState('kolibri_content_url').value;
    },
  },

  methods: {

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

    //get topic thumbnail url.
    getTopicThumbnailUrl(topic) {
      if (!topic || !topic.files) return null;

      const thumbnail = topic.files.find(file => file.preset === 'topic_thumbnail');
      if (thumbnail) return thumbnail.storage_url;
      else return null;
    },

    ////////////////////////////////// SCREEN CONTROLS.

    //view full screen.
    goFullScreen(div_id) {
      if (!div_id) return;

      //update UI.
      this.full_screen = true;

      const elem = document.getElementById(div_id);
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      }
      else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen() // Safari
      }
      else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen() // Firefox
      }
      else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen() // IE/Edge
      }
    },


    //exit full screen.
    exitFullScreen() {
      this.full_screen = false;
      document.exitFullscreen();
    },

    ////////////////////////////////// SCREEN CONTROLS.


    ////////////////////////////////// CHANNEL CONTROLS.

    //get channels.
    async getChannels() {
      try {
        //reset UI.
        this.channel = null;
        this.topic   = null;

        //fetch channels.
        this.is_loading = true;
        this.channels   = await $fetch(this.kolibri_channel_url);
        this.is_loading = false;
      }
      catch (e) { //fetch error.
        this.$toast.add({
          severity: 'warn',
          summary : 'channels error',
          detail  : 'unable to get channels',
          life    : 2000
        });
      }
    },

    //get channels.
    async getChannelTopics(channel) {
      //channel check.
      if (!channel) return;

      //fetch.
      try {
        //UI update.
        this.topic = null;

        //load topics.
        this.is_loading = true;
        channel.topics  = await $fetch(this.kolibri_content_url + channel.id);
        this.is_loading = false;

        //set active.
        this.channel = channel;
      }
      catch (e) { //fetch error.
        this.$toast.add({
          severity: 'warn',
          summary : 'channels error',
          detail  : 'unable to get channels',
          life    : 2000
        });
      }
    },

    ////////////////////////////////// CHANNEL CONTROLS.


    ////////////////////////////////// TOPIC CONTROLS.

    //get topics.
    async getTopics(topic) {
      if (!topic || !topic.id) return;

      try {
        this.is_loading = true;
        topic.topics    = await $fetch(this.kolibri_content_url + topic.id);
        this.is_loading = false;
      }
      catch (e) { //fetch error.
        this.$toast.add({
          severity: 'warn',
          summary : 'topics error',
          detail  : 'unable to get topics',
          life    : 2000
        });
      }
    },

    //get topics.
    async closeView() {
      //update session topic.
      if (this.topic) await useUpdateSubjectSession(this.topic.title);

      //update UI.
      this.channel = null;
      this.topic   = null;
    },

    //view topic.
    async viewTopic(topic) {
      this.topic                   = topic;
      this.viewed_topics[topic.id] = topic;

      //get topics
      if (!topic.is_leaf) await this.getTopics(topic);
      await useUpdateSubjectSession(topic.title);
    },

    //close topic view.
    closeTopic(topic = this.topic) {
      if (!topic) return;

      //parent view.
      if (!topic.parent) this.topic = null;
      else if (this.viewed_topics[topic.parent]) this.topic = this.viewed_topics[topic.parent];
      else this.topic = null;
    },

    ////////////////////////////////// TOPIC CONTROLS.
  },

  beforeMount() {
    this.channel = null;
  },

  async mounted() {
    this.updateUrl({provider: 'kolibri', grade: null, subject: null, link: null});
    await this.getChannels();
  }
})
</script>
