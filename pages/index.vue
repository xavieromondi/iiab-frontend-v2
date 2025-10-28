<template>
  <template v-if="useState('ui').value !== 'login'">

    <!-- admin navbar -->
    <nav v-if="useState('admin').value" style="height:10vh"
         class="bg-green-800 fadein animation-duration-500 flex align-items-center justify-content-between text-white text-xs uppercase select-none">


      <!-- logo | avatar | rating -->
      <div class="h-full flex justify-content-between align-items-center">

        <!-- logo -->
        <div @click="close_entry=new Date().getTime()"
             class="w-6rem md:w-7rem lg:w-9rem h-full pl-3 md:pl-3 lg:pl-5 slash bg-green-900 flex align-items-center shadow-4">
          <img alt="AHAINNOVATE LOGO"
               class="w-3rem md:w-4rem"
               src="/colored-text-logo.svg"/>
        </div>
        <!-- /logo -->

        <!-- avatar -->
        <div class="h-full md:pl-3 flex align-items-center gap-2 capitalize">

          <!-- avatar icon -->
          <Avatar class="bg-white shadow-2 border-1 border-green-600"
                  icon="pi pi-user" rounded
                  shape="circle"
                  size="small"/>

          <!-- avatar | name -->
          <div class="flex align-items-center gap-2">

            <!-- user school & user -->
            <template v-if="useState('session').value">
              <div class="white-space-nowrap">
                <Badge :value="useState('session').value.school.name" severity="primary" size="small"/>
              </div>

              <div class="white-space-nowrap">
                <Badge :value="useState('session').value.class_.name" severity="warn" size="small"/>
              </div>
            </template>
            <!-- user school & user -->

            <!-- admin -->
            <div v-else>
              <div class="font-bold">{{ useState('admin').value }}</div>
              <div class="font-light">Admin</div>
            </div>
            <!-- /admin -->

          </div>
          <!-- /user school & class -->

        </div>
        <!-- /avatar -->

        <!-- user rating -->
        <div v-if="false && !useState('admin').value" class="h-full px-4 hidden md:flex gap-2 align-items-center">
          <Rating :model-value="3"
                  :stars="5"
                  class="text-yellow-500 flex gap-1" readonly unstyled/>
          <ProgressBar :value="50" class="h-1rem w-6rem"/>
        </div>
        <!-- /user rating -->
      </div>
      <!-- /logo | avatar | rating -->


      <!-- right menu -->
      <div class="h-full flex justify-content-end">

        <!-- registration -->
        <Button
            :class="`h-full px-4 border-none border-noround text-white text-xs ${useState('ui').value === 'registration' ? 'bg-orange-600' : 'bg-green-800'}`"
            @click="useState('ui').value = 'registration'">
          <i class="pi pi-plus text-xs"/>
          <span class="hidden md:flex">Registration</span>
        </Button>
        <!-- /registration -->

        <!-- dashboard -->
        <Button
            :class="`h-full px-4 border-none border-noround text-white text-xs ${useState('ui').value === 'dashboard' ? 'bg-orange-600' : 'bg-green-800'}`"
            @click="useState('ui').value = 'dashboard'">
          <i class="pi pi-chart-line text-xs"/>
          <span class="hidden md:flex">Dashboard</span>
        </Button>
        <!-- /dashboard -->

        <!-- logout -->
        <Button :loading="logging_out"
                class="h-full px-4 bg-green-900 border-none border-noround text-white text-xs"
                @click="logout">
          <i class="pi pi-power-off text-xs"/>
          <span class="hidden md:flex">Logout</span>
        </Button>
        <!-- /logout -->
      </div>
      <!-- /right menu -->

    </nav>
    <!-- /admin navbar -->

  </template>

  <ClientOnly>
    <Login v-if="useState('ui').value === 'login'"/>
    <Registration v-else-if="useState('ui').value === 'registration'"/>
    <Learn :close="close_entry" v-else-if="useState('ui').value === 'learn'"/>
    <Dashboard v-else-if="useState('ui').value === 'dashboard'"/>
  </ClientOnly>

  <Toast class="w-18rem"/>
</template>


<script setup lang="js">
useState('ui', () => 'login');
useState('session', () => {
})

//logout.
useState('logout', () => null);
</script>


<script lang="js">
export default defineComponent({
  name: "index",

  data() {
    return {
      logging_out: false,
      close_entry: null
    }
  },

  computed: {
    server_url() {
      return useState('server_url').value;
    },
    content_provider() {
      return useState('content_provider').value;
    }
  },

  methods: {
    //save session.
    async saveSession() {
      const session    = useState('session').value.data;
      session.end_time = new Date().getTime();

      try {
        await $fetch(this.server_url + 'sessions', {
          method: 'POST',
          body  : JSON.stringify(session)
        });
      }
      catch (e) {
        this.notify('session error', 'Sorry, unable to update session', 'warn');
      }
    },

    //notify.
    notify(title, details, severity) {
      this.$toast.add({
        severity: severity || 'info',
        summary : title || 'Update',
        detail  : details,
        life    : 2000
      });
    },

    //logout.
    async logout() {
      //logout | update UI.
      useState('logout').value = 1;
      useState('admin').value  = null;
      useState('ui').value     = "login";
    },
  },

});
</script>