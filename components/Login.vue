<template>
  <div class="grid m-0 h-screen bg-white text-gray-700 select-none relative">

    <!-- Left column -->
    <div aria-label="Educational learning environment"
         class="hidden md:col-5 md:flex flex-column justify-content-end bg-cover"
         style="background-image: url('login-image.jpg')">

      <!-- Heading -->
      <h1
          class="m-0 p-4 text-white font-bold uppercase text-4xl z-1"
          aria-label="Welcome to Access Hub Africa Learning Platform">
        Let's Learn!
      </h1>
      <!-- /Heading -->


      <!-- Company information footer -->
      <footer class="p-4 z-1 text-xs text-gray-300">

        <div aria-level="2" class="font-bold" role="heading">
          AHAINNOVATE Limited.
        </div>

        <div>
          (Access Hub Africa)
        </div>

        <div>
          www.accesshub-africa.com
        </div>

      </footer>
      <!-- /Company information footer -->

    </div>
    <!-- /left col -->


    <!-- right col -->
    <div class="col-12 md:col-7 capitalize">

      <!-- admin toggle -->
      <div class="p-3 text-right">
        <ToggleSwitch id="admin-toggle" v-model="admin"/>
      </div>
      <!-- /admin toggle -->


      <!-- form container -->
      <div class="md:h-30rem flex align-items-center justify-content-center">
        <div class="w-9 lg:w-6 xl:w-5 text-center">

          <!-- header -->
          <div class="py-3 text-center">
            <img alt="Access Hub Africa logo"
                 class="h-2rem lg:h-3rem"
                 role="img"
                 src="/green-orange-logo.svg"/>
          </div>
          <!-- /header -->


          <!-- login header -->
          <div class="py-3">
            <div>
              <Button
                  :class="`border-none ${school && class_ ? 'border-none bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`"
                  :loading="is_loading"
                  :outlined="! (school && class_)"
                  aria-label="Secure login Status"
                  icon="pi pi-lock"
                  rounded raised
                  @click="fetchSchools(); fetchClassTypes()"/>
            </div>
            <div class="py-3">
              {{ admin ? 'admin' : 'user' }} login
            </div>
          </div>
          <!-- /login header -->


          <!-- form -->
          <div class="py-4">

            <template v-if="!admin">

              <Skeleton v-if="is_loading && !school" class="w-full h-3rem border-round-1xl"/>

              <!-- user school -->
              <div v-if="schools.length" class="py-2">
                <label aria-label="Please select your school from the list"
                       class="text-xs"
                       for="school-select">
                  Please select your school
                </label>
                <Select v-if="schools.length"
                        id="school-select"
                        v-model="school"
                        :options="schools"
                        aria-describedby="school-instruction"
                        aria-required="true"
                        class="fadein animation-duration-500" filter fluid
                        option-label="name"
                        placeholder="Select school"/>
              </div>
              <!-- /user school -->


              <!-- user grade -->
              <div v-if="school" class="py-2">

                <template v-if="classes.length">
                  <label aria-label="Please select your class or group or grade from the list"
                         class="sr-only text-xs" for="grade-select">
                    Please select your class / group / grade
                  </label>
                  <Select id="grade-select"
                          v-model="class_"
                          :options="getClassOptions()"
                          aria-describedby="grade-instruction"
                          aria-required="true"
                          class="fadein animation-duration-500" filter fluid
                          option-label="name"
                          placeholder="Select class"/>
                </template>

                <!-- Empty Classes -->
                <div v-else-if="!is_loading"
                     role="status"
                     class="text-xs text-center fadein animation-duration-2000">
                  No Classes Available
                </div>
              </div>
              <!-- /user grade -->

              
            </template>

            <!-- admin -->
            <div v-else class="fadein animation-duration-1000">
              <!-- username -->
              <div class="py-1">
                <label for="username-ip" class="text-xs text-gray-500">Username</label>
                <InputText id="username-ip" v-model="username" autocomplete="off" fluid/>
              </div>
              <!-- /username -->

              <!-- password -->
              <div class="py-2 text-gray-500">
                <label class="text-xs" for="password-ip">Password</label>
                <InputText id="password-ip" v-model="password" fluid type="password"/>
              </div>
              <!-- /password -->

              <!-- error message -->
              <div v-if="login_error"
                   aria-live="assertive"
                   class="py-2 text-xs text-orange-400 text-center">
                <i class="pi pi-exclamation-circle text-xs"/>
                Wrong username / Password
              </div>
              <!-- /error message -->
            </div>
            <!-- /admin -->

          </div>
          <!-- /form -->


          <!-- submit -->
          <div>
            <Skeleton v-if="is_loading" class="w-full h-3rem border-round-3xl"/>

            <Button v-else
                    :disabled="(admin && (!username || !password)) || (!admin && (!class_))"
                    :loading="is_loading"
                    class="w-full h-3rem fadein animation-duration-1000"
                    icon="pi pi-user"
                    label="Login"
                    raised role="button" rounded
                    severity="primary"
                    @click="login"/>
          </div>
          <!-- /submit -->


          <!-- mobile footer -->
          <div class="h-5rem md:hidden text-center pt-6 text-xs text-gray-600"
               aria-label="Company information">
            <div>AHAINNOVATE Limited.</div>
            <div>(Access Hub Africa)</div>
          </div>
          <!-- mobile footer -->

        </div>
      </div>
      <!-- /form container -->

    </div>
    <!-- /right col -->

  </div>
</template>


<script setup lang="js">
useState('admin', () => null);
</script>


<script lang="js">
export default defineComponent({

  name: "Login",

  data() {
    return {
      //UI.
      is_loading: true,

      //school | grade.
      school: null,
      class_: null,

      //school list.
      schools    : [],
      classes    : [],
      class_types: [],

      //auth.
      admin      : 0,
      username   : "kamara",
      password   : 12,
      submit     : null,
      login_error: null
    }
  },

  computed: {
    server_url() {
      return useState('server_url').value;
    },
  },

  watch: {
    //check selected school.
    async school() {
      await this.fetchClasses();
    },

    //check selected class.
    async class_() {
      return;
    },
  },

  methods: {
    //global auth.
    async login() {
      if (this.admin) await this.adminLogin();
      else await this.userLogin();
    },

    //user auth.
    async userLogin() {
      //initialize session.
      try {
        this.is_loading = true;
        const res       = await $fetch(this.server_url + 'sessions', {
          method: 'POST',
          body  : {
            school: this.school.id,
            class_: this.class_.id,
            pupil : null
          }
        });
        this.is_loading = false;

        //session initialize error.
        if (res.error) {
          this.$toast.add({
            severity: 'warn',
            summary : 'Session Error',
            detail  : res.error,
            life    : 2000
          });
        }

        //session init.
        else if (res.data) {
          useState('session').value.data   = res.data;
          useState('session').value.school = this.school;
          useState('session').value.class_ = this.class_;
          useState('session').value.pupil  = null;
        }

        //ui update.
        useState('ui').value = 'learn';

        //matomo tracking.
        this.trackMatomoLogin();
      }

          //user login error.
      catch (e) {
        //notify | stop loading.
        this.$toast.add({
          severity: 'warn',
          summary : 'Login error',
          detail  : 'Sorry, unable to login',
          life    : 2000
        });
        this.is_loading = false;
      }
    },

    //admin login.
    async adminLogin() {
      //params check.
      if (!this.username || !this.password) return;

      //login attempt.
      try {
        //admin login.
        this.is_loading = true;
        const res       = await $fetch(this.server_url + 'admins', {
          method: "POST",
          body  : JSON.stringify({ // Stringify the body
            username: this.username,
            password: this.password,
            login   : 1
          })
        });
        this.is_loading = false;

        //successful login.
        if (res.success) {
          //disable session tracking.
          useState('session').value = null;
          useState('admin').value   = this.username;

          //set registration UI | notify.
          useState('ui').value = 'registration';
          this.$toast.add({
            severity: 'success',
            summary : 'Login successful',
            detail  : res.success,
            life    : 2000
          });
        }

        //server login error.
        else if (res.error) {
          this.login_error = "Unable to login, please again later.";
          this.$toast.add({
            severity: 'warn',
            summary : 'Login error',
            detail  : res.error,
            life    : 2000
          });
        }

      } //login.

          //client login error.
      catch (e) {
        //stop load.
        this.is_loading  = false;
        this.login_error = "Wrong username / password";
        this.serverOffline();
      }
    },


    //fetch Schools.
    async fetchSchools() {
      //reset active school.
      this.school = null;

      try {
        this.is_loading = true;
        this.schools    = await $fetch(this.server_url + 'schools/');
        this.is_loading = false;
      }
      catch (e) {
        this.serverOffline();
        this.is_loading = false;
      }
    },

    //fetch classes.
    async fetchClasses() {
      //no active school.
      if (!this.school) return;

      try {
        this.is_loading = true;
        this.classes    = await $fetch(this.server_url + `classes?school=${this.school.id}`);
        this.class_     = null;
        this.is_loading = false;
      }
      catch (e) {
        this.serverOffline();
        this.is_loading = false;
      }
    },

    //fetch classes.
    async fetchClassTypes() {
      try {
        this.is_loading  = true;
        this.class_types = await $fetch(this.server_url + `class_types`);
        this.is_loading  = false;
      }
      catch (e) {
        this.serverOffline();
        this.is_loading = false;
      }
    },

    //server offline popup.
    serverOffline() {
      this.$toast.add({
        severity: 'warn',
        summary : 'Load Error',
        detail  : 'Sorry, server offline',
        life    : 2000
      });
    },

    //session reset.
    resetSession() {
      useState('session').value = {
        school: null,
        class_: null,
        admin : null,
        data  : null
      }
    },

    //generate class names.
    getClassOptions() {
      const options = this.classes.map(class_ => {
        //fetch class type data.
        const class_type = this.class_types.find(class_type => Number(class_type.id) === Number(class_.name));

        //push class data.
        if (class_type) return {
          name: class_.group ? `${class_type.name} - ${class_.group}` : class_type.name,
          id  : class_.id
        }
        return null;
      }).filter(Boolean);

      const rankFor = (name) => {
        const n = (name || '').toString().trim().toLowerCase();
        if (/^pp\\s*1\\b/.test(n) || /^pp1\\b/.test(n)) return 0;
        if (/^pp\\s*2\\b/.test(n) || /^pp2\\b/.test(n)) return 1;
        const m = n.match(/^grade\\s*(\\d+)\\b/);
        if (m) return 2 + Math.max(0, Number(m[1]) - 1);
        return 999;
      };

      const groupKey = (name) => {
        const m = (name || '').match(/-\\s*(.+)$/);
        if (!m) return '';
        const g = m[1].trim();
        const num = parseInt(g, 10);
        if (!Number.isNaN(num)) return num;
        return g.toLowerCase();
      };

      return options.sort((a, b) => {
        const ra = rankFor(a.name);
        const rb = rankFor(b.name);
        if (ra !== rb) return ra - rb;
        const ga = groupKey(a.name);
        const gb = groupKey(b.name);
        if (ga < gb) return -1;
        if (ga > gb) return 1;
        return a.name.localeCompare(b.name);
      });
    },

    //matomo tracking.
    trackMatomoLogin() {
      if (!window._paq) return;

      const class_     = this.classes.find(c => Number(c.id) === Number(this.class_.id));
      const class_type = class_ ? this.class_types.find(ct => Number(ct.id) === Number(class_.name)) : null;
      const grade_name = class_type ? class_type.name : null;
      const group_name = class_ ? class_.group : null;

      //store tracking meta on session for restore.
      useState('session').value.meta = {
        school  : this.school.name,
        grade   : grade_name || '',
        group   : group_name || '',
        pupil_id: ''
      };

      const dims = useState('matomo_dims').value;
      if (dims?.school) _paq.push(['setCustomDimension', dims.school, this.school.name]);
      if (dims?.grade) _paq.push(['setCustomDimension', dims.grade, grade_name || '']);
      if (dims?.group) _paq.push(['setCustomDimension', dims.group, group_name || '']);
      if (dims?.pupil_id) _paq.push(['setCustomDimension', dims.pupil_id, '']);
      _paq.push(['trackPageView']);
      _paq.push(['trackEvent', 'Auth', 'Login', 'Group']);
    },
  },

  async mounted() {
    if (useState('logout').value) useState('logout').value = null;

    //reset session.
    this.resetSession();

    await this.fetchSchools();
    if (this.schools.length) await this.fetchClassTypes();
  }

})
</script>
