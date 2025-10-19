<template>

  <div class="grid m-0 h-screen bg-white text-gray-700 select-none">

    <!-- Left column -->
    <div aria-label="Educational learning environment"
         class="hidden md:col-5 md:flex flex-column justify-content-end"
         role="img" style="background-image: url('login-image-2.jpg'); background-size: cover">

      <!-- Heading -->
      <div class="lg:h-3rem pl-4 flex align-items-start">
        <h1 class="text-white font-bold uppercase text-4xl m-0">
          Let's Learn!
        </h1>
      </div>
      <!-- /Heading -->


      <!-- Company information footer -->
      <footer class="h-4rem pl-4 text-xs text-gray-300">

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
      <div class="h-10rem lg:h-4rem p-3 lg:p-2 flex align-items-start justify-content-end">
        <ToggleSwitch id="admin-toggle" v-model="admin"/>
      </div>
      <!-- /admin toggle -->


      <!-- form container -->
      <div class="lg:h-30rem flex justify-content-center align-items-center">
        <div class="w-8 lg:w-4">

          <!-- header -->
          <div class="h-4rem lg:h-6rem flex align-items-center justify-content-center">
            <img alt="Access Hub Africa logo"
                 class="h-2rem lg:h-3rem"
                 role="img"
                 src="/green-orange-logo.svg"/>
          </div>
          <!-- /header -->


          <!-- login header -->
          <div class="flex flex-column align-items-center">
            <Button
                :class="`${school && class_ ? 'border-none bg-green-600 text-white' : 'bg-gray-300 border-gray-700 text-gray-700'} shadow-1`"
                :loading="is_loading"
                :outlined="! (school && class_)"
                aria-label="Secure login Status"
                icon="pi pi-lock"
                rounded
                @click="fetchSchools(); fetchClassTypes()"/>

            <span class="sr-only py-2">
              {{ admin ? 'admin' : 'user' }} login
            </span>
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
                <div v-else class="text-xs text-center fadein animation-duration-2000">
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
              <div v-if="login_error" class="py-2 text-xs text-orange-400 text-center">
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
                    :disabled="(admin && (!username || !password)) || (!admin && !class_)"
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
          <div class="h-5rem md:hidden text-center pt-6 text-xs text-gray-600">
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
useState('session', () => {
  return {
    school: null,
    class_: null
  }
});
</script>


<script lang="js">
export default defineComponent({

  name: "Login",

  data() {
    return {
      //server_url.
      //server_url: "backend/api/", //production
      //server_url: "http://localhost:3001/api/", // dev mode

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
            class_: this.class_.id
          }
        });
        this.is_loading = false;

        //session initialize error.
        if (res.error) {
          this.notify('Session Error', res.error, 'warn');
        }

        //initiate session.
        else if (res.data) {
          useState('session').value.data   = res.data;
          useState('session').value.school = this.school;
          useState('session').value.class_ = this.class_;
        }

        //ui update.
        useState('ui').value = 'learn';
      }
      catch (e) {
        //notify | stop loading.
        this.notify('Login error', 'Sorry, unable to login', 'warn');
        this.is_loading = false;
      }
    },

    //admin login.
    async adminLogin() {
      //params check.
      if (!this.username || !this.password) return;

      //disable session for admin.
      useState('session').value = null;

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

          //notify.
          this.notify(res.success, '', 'success');

          //set admin name.
          useState('admin', () => this.username);
          //set UI.
          useState('ui').value = 'registration';

        }

        //server login error.
        else {
          this.login_error = "Unable to login, please again later.";
          this.notify('Login Error, ', res.error, 'warn');
        }
      }

      //client login error.
      catch (e) {
        //stop load.
        this.is_loading = false;

        //notify.
        this.login_error = "Wrong username / password";
        this.notify('Login Error, ', 'sorry, server offline', 'warn');
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
        this.notify('Schools Error', 'Server offline', 'warn');
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
        this.is_loading = false;
      }
      catch (e) {
        this.notify('Class Load Error', 'Server offline', 'warn');
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
        this.notify('Class type Load Error', 'Server offline', 'warn');
        this.is_loading = false;
      }
    },


    //generate class names.
    getClassOptions() {
      return this.classes.map(class_ => {
        //fetch class type data.
        const class_type = this.class_types.find(class_type => class_type.id === class_.name);

        //push class data.
        if (class_type) return {
          name: class_type.name,
          id  : class_.id
        }

      });
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
  },

  async beforeMount() {
    await this.fetchSchools();
    if (this.schools.length) await this.fetchClassTypes();
  },

  async mounted() {
    //session reset.
    if (useState('logout').value) useState('session').value = {};
  }

})
</script>