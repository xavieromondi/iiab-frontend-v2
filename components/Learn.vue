<template>
  <div class="grid m-0 bg-white select-none overflow-hidden">

    <!-- user navbar -->
    <nav class="col-12 p-0 bg-green-600 fadein animation-duration-500">

      <div class="grid m-0">
        <!-- logo -->
        <div class="col-7 lg:col-3 p-0 flex gap-2">
          <!-- logo -->
          <div class="h-full py-4 pl-3 pr-5 slash bg-green-900">
            <img alt="ahainnovate logo" class="h-full w-auto" src="/colored-text-logo.svg"/>
          </div>

          <!-- avatar | menu -->
          <div class="flex gap-1 align-items-center">
            <Button icon="pi pi-user" rounded raised
                    severity="secondary"
                    size="small"/>
            <Badge :value="useState('session').value.class_.name"
                   class="capitalize"
                   severity="warn"/>
          </div>
          <!-- /avatar | menu -->
        </div>
        <!-- /logo -->

        <!-- menu -->
        <div class="col-5 lg:col-9 p-0 pr-3 flex align-items-center justify-content-end gap-3">

          <Button class="lg:hidden"
                  icon="pi pi-book"
                  label="Learn" raised rounded
                  @click="showDrawer=true"/>

          <!-- content_providers -->
          <Button v-for="content_provider_ in content_providers"
                  :key="content_provider_"
                  :label="content_provider_"
                  :outlined="content_provider !== content_provider_"
                  :class="'hidden lg:block border-1 border-green-200 text-white capitalize ' +
                 (content_provider === content_provider_ ? 'bg-orange-500 hover:bg-orange-500' : 'hover:bg-green-500 hover:shadow-3')"
                  rounded raised
                  @click="useState('content_provider').value = content_provider_"/>
          <!-- /content_providers -->

          <!-- Services Button -->
          <Button
            label="Services"
            icon="pi pi-server"
            :outlined="content_provider !== 'services'"
            :class="'hidden lg:block border-1 border-green-200 text-white ' +
                   (content_provider === 'services' ? 'bg-orange-500 hover:bg-orange-500' : 'hover:bg-green-500 hover:shadow-3')"
            rounded raised
            @click="useState('content_provider').value = 'services'"
          />
          <!-- /Services Button -->

          <!-- logout -->
          <div class="md:pl-4">
            <Button :loading="logging_out" size="small"
                    class="text-red-600 font-bold"
                    icon="pi pi-power-off" raised rounded
                    severity="secondary"
                    @click="logout"/>
          </div>
          <!-- /logout -->
        </div>
        <!-- /menu -->
      </div>

    </nav>
    <!-- /user navbar -->


    <!-- general content -->
    <Zims :close="close" v-if="content_provider === 'general'"/>

    <!-- msingi pack content -->
    <Msingi v-else-if="content_provider === 'msingi'"/>

    <!-- esoma content -->
    <Esoma v-else-if="content_provider === 'esoma'"/>

    <!-- local / usb content -->
    <LocalContent v-else-if="content_provider === 'local'"/>

    <!-- kolibri content -->
    <Kolibri v-else-if="content_provider === 'kolibri'"/>

    <!-- Africana content -->
    <Africana v-else-if="content_provider === 'africana'"/>

    <!-- Services Grid Component -->
    <ServicesGrid v-else-if="content_provider === 'services'"/>

    <!-- Assignments -->
    <Assignments v-else-if="content_provider === 'assignments'"/>

    <!-- Assignments -->
    <Assignments v-else-if="content_provider === 'assignments'"/>


    <Drawer v-model:visible="showDrawer" header="Let's Learn" position="right">
      <div v-for="content_provider_ in content_providers" :key="content_provider_" class="pt-2">
        <!-- content_providers -->
        <Button :class="'w-8 border-none text-white capitalize ' +
                 (content_provider === content_provider_ ? 'bg-orange-500 hover:bg-orange-500' : 'bg-green-700 hover:bg-green-500 hover:shadow-3')"
                :label="content_provider_"
                :outlined="content_provider !== content_provider_"
                icon="pi pi-angle-right"
                icon-pos="right"
                raised rounded
                @click="useState('content_provider').value = content_provider_; showDrawer=false;"/>
        <!-- /content_providers -->
      </div>
    </Drawer>

  </div>
</template>


<script lang="js">
import {useSaveSession} from "~/composables/useSaveSession.js";

export default defineComponent({
  //parent close request.
  props: ['close'],
  name: "Subjects",

  data() {
    return {
      //msingi pack.
      msingi_content: {},
      mp_grade: null,
      mp_content: null,
      subject: null,
      subject_is_loading: false,

      //content providers.
      content_providers: ['msingi', 'africana', 'local', 'general', 'esoma', 'kolibri', 'services', 'assignments'],

      //entries.
      entry: null,
      entries: [],

      //pagination.
      start: 0,
      end: 9,

      //pagination controls.
      prev: null,
      next: 1,

      //UI.
      is_loading: false,
      full_screen: false,
      logging_out: false,

      //drawer.
      showDrawer: false,
    }
  },

  computed: {
    content_provider() {
      return useState('content_provider').value;
    }
  },

  watch: {
    content_provider(val) {
      this.updateProviderUrl(val);
    },
  },

  methods: {

/////////////////////////////////////////// GLOBAL CONTROLS.

    //logout.
    async logout() {
      //save session.
      if (useState('session').value) {
        this.logging_out = true;
        if (useState('session').value) await useSaveSession();
        this.logging_out = false;
      }

      //logout | update UI.
      useState('logout').value = 1;
      useState('admin').value = null;
      useState('ui').value = "login";
    },

    //sync provider to url.
    updateProviderUrl(provider) {
      if (!this.$router || !this.$route) return;
      const query = {...this.$route.query, provider};
      if (provider && provider !== this.$route.query.provider) {
        delete query.grade;
        delete query.subject;
        delete query.link;
      }
      this.$router.replace({query});
    },

/////////////////////////////////////////// GLOBAL CONTROLS.
  },

  mounted() {
    const provider = this.$route?.query?.provider;
    if (provider) useState('content_provider').value = provider;
    else this.updateProviderUrl(this.content_provider);
  },

});
</script>


<style scoped>
.p-progressbar-value {
  background-color: #00ff00;
}

a {
  text-decoration: none !important;
}

</style>
