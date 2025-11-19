<template>
  <div class="grid m-0 bg-white select-none">

    <!-- user navbar -->
    <nav class="col-12 p-0 bg-green-600 fadein animation-duration-500 flex align-items-center justify-content-between">

      <div class="flex gap-2">
        <!-- logo -->
        <div class="h-full py-3 pl-3 pr-5 slash bg-green-900">
          <img alt="ahainnovate logo"
               class="w-4rem"
               src="/colored-text-logo.svg"/>
        </div>

        <!-- avatar | menu -->
        <div class="flex gap-3 align-items-center">
          <div class="flex align-items-center gap-2">
            <Button icon="pi pi-user" rounded raised
                    severity="secondary"
                    size="small"/>
            <Badge :value="useState('session').value.class_.name"
                   class="capitalize"
                   severity="warn"/>
          </div>
        </div>
        <!-- /avatar | menu -->
      </div>


      <!-- menu -->
      <div class="pr-3 flex align-items-center justify-content-end gap-3">

        <!-- content_providers -->
        <Button v-for="content_provider_ in content_providers"
                :key="content_provider_"
                role="button"
                :outlined="content_provider !== content_provider_"
                :class="'border-none border-1 border-green-200 ' +
                 (content_provider === content_provider_ ? 'bg-orange-500 hover:bg-orange-500' : 'hover:bg-green-500 hover:shadow-3')"
                rounded size="small" raised
                @click="useState('content_provider').value = content_provider_">
          <span class="capitalize text-white">
            {{ content_provider_ }}
          </span>
        </Button>
        <!-- /content_providers -->


        <!-- logout -->
        <div class="pl-8">
          <Button :loading="logging_out" size="small"
                  class="text-red-600 font-bold"
                  icon="pi pi-power-off" raised rounded
                  severity="secondary"
                  @click="logout"/>
        </div>
        <!-- /logout -->
      </div>
      <!-- /menu -->

    </nav>
    <!-- /user navbar -->


    <!-- general content -->
    <Zims :close="close" v-if="content_provider === 'general'"/>


    <!-- msingi pack content -->
    <Msingi v-else-if="content_provider === 'msingi'"/>


    <!-- esoma content -->
    <Esoma v-else-if="content_provider === 'esoma'"/>


    <!-- usb content -->
    <USB v-else-if="content_provider === 'usb'"/>


    <!-- kolibri content -->
    <Kolibri v-else-if="content_provider === 'kolibri'"/>

  </div>
</template>


<script lang="js">
import {useUpdateSubjectSession} from "~/composables/useUpdateSubjectSession.js";
import {useSaveSession} from "~/composables/useSaveSession.js";

export default defineComponent({
  //parent close request.
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

      //content providers.
      content_providers: ['usb', 'general', 'msingi', 'esoma', 'kolibri'],

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
    content_provider() {
      return useState('content_provider').value;
    }
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
      useState('admin').value  = null;
      useState('ui').value     = "login";
    },

/////////////////////////////////////////// GLOBAL CONTROLS.
  },

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