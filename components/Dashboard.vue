<template>
  <!-- content grid -->
  <div class="grid m-0 bg-white text-gray-700 fadein animation-duration-500 select-none">

    <!-- left col -->
    <div class="col-12 md:col-6 p-2 md:p-3 lg:p-4">

      <!-- categories header -->
      <div class="grid m-0 border-1 border-gray-200 capitalize">

        <div v-for="category in ['subjects', 'classes', 'schools', 'regions']"
             :class="'col-3 pl-3 hover:shadow-2 pointer-cursor' + (category===active_category ? ' bg-orange-600 text-white' : '')"
             @click="active_category=category">

          <div>
            <div class="text-2xl">{{ getItemCount(category) }}</div>
            <div class="text-xs">{{ category }}</div>
          </div>

        </div>

      </div>
      <!-- /categories header -->


      <!-- table grid -->
      <div class="grid m-0 select-none">

        <div class="col-12 p-0">

          <DataTable
              v-model:filters="filters"
              :globalFilterFields="['name']"
              :row-class="rowClass"
              :rows="5"
              sort-field="sessions"
              :sort-order="-1"
              :value="tableData"
              class="border-right-1 border-left-1 border-gray-200 text-xs"
              data-key="id" paginator
              row-hover size="large" striped-rows>

            <template #header>
              <div class="p-3 md:flex justify-content-between align-items-center">

                <div class="w-full md:w-8 pb-2 lg:py-1 flex align-items-center justify-content-between md:justify-content-start gap-3">
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-search"/>
                    </InputIcon>
                    <InputText v-model="filters['global'].value" fluid
                               placeholder="Search"
                               class="border-round-2xl"
                               size=""/>
                  </IconField>
                  <Button :loading="is_loading"
                          icon="pi pi-refresh" outlined rounded
                          class="border-1 border-gray-300"
                          severity="secondary"
                          @click="loadUI"/>
                </div>

                <div v-if="activeItem" class="pt-3 lg:p-0 lg:text-right">
                  <Button v-if="activeItem"
                          :label="active_category==='classes' ? getClassName(activeItem.name) : activeItem.name"
                          class="border-1 border-orange-600 capitalize fadein animation-duration-500"
                          icon="pi pi-times"
                          icon-pos="right" outlined
                          rounded severity="warn" size="small"
                          @click="activeItem=null"/>
                </div>

              </div>
            </template>

            <!-- Name -->
            <Column :header="active_category"
                    class="lg:w-12rem pl-2 lg:pl-3 white-space-nowrap capitalize"
                    field="name"
                    header-class="capitalize font-light text-xs text-gray-700 surface-100 border-bottom-1 border-gray-300">

              <template #body="{data}">

                <!-- item name -->
                <div class="font-bold">
                  {{ active_category === 'classes' ? getClassName(data.name) : data.name }}
                </div>

                <!-- school name -->
                <div v-if="active_category === 'classes' && data.school" class="font-light">
                  {{ getItemNameByID('schools', data.school) }}
                </div>

                <div class="flex">
                  <Rating :model-value="3"
                          :stars="5"
                          class="text-yellow-500 flex gap-1 text-xs"
                          readonly unstyled/>
                </div>

              </template>

            </Column>
            <!-- /Name -->


            <!-- Sessions -->
            <Column class="w-7rem pl-2"
                    field="sessions"
                    header="Sessions"
                    header-class="w-7rem pl-2 surface-100 border-bottom-1 border-gray-300"/>


            <!-- region schools -->
            <Column v-if="active_category==='regions'"
                    class="w-7rem pl-2"
                    field="schools"
                    header="Schools"
                    header-class="w-7rem pl-2 surface-100 border-bottom-1 border-gray-300"/>


            <!-- School classes -->
            <Column v-if="active_category==='schools'"
                    class="w-7rem pl-2"
                    field="classes"
                    header="Classes"
                    header-class="w-7rem pl-2 surface-100 border-bottom-1 border-gray-300"/>


            <!-- session_total_time -->
            <Column class="w-7rem pl-2"
                    field="session_total_time"
                    header="Total (Minutes)"
                    header-class="w-7rem pl-2 surface-100 border-bottom-1 border-gray-300"/>


            <!-- session_avg -->
            <Column class="w-7rem pl-2"
                    field="session_avg"
                    header="Minutes / Session"
                    header-class="w-7rem pl-2 surface-100 border-bottom-1 border-gray-300"/>


            <!-- region schools -->
            <Column v-if="active_category==='subjects'"
                    class="w-7rem pl-2"
                    field="views"
                    header="Views"
                    header-class="w-7rem pl-2 surface-100 border-bottom-1 border-gray-300"/>


            <!-- Manage Column -->
            <Column header-class="w-4rem surface-100 border-bottom-1 border-gray-300">
              <template #body="{data}">
                <div class="flex gap-3 justify-content-end">
                  <Button :outlined="data!==activeItem"
                          class="hover:shadow-2"
                          icon="pi pi-chart-line" rounded
                          severity="secondary"
                          @click="activeItem=data"/>
                </div>
              </template>
            </Column>


          </DataTable>

          <!-- subject average -->
          <div class="grid m-0 surface-100 border-1 border-gray-300 capitalize">

            <!-- subject views -->
            <div class="col-12 md:col-4 lg:col-5 p-0 border-right-1 border-gray-300 text-xs">

              <div
                  class="w-full h-8rem lg:pl-3 border-bottom-1 border-gray-300 flex justify-content-center align-items-center fadein animation-duration-1000">
                <div class="text-center font-bold">
                  <Knob v-model="totalSubjectViews"
                        :max="100"
                        :size="80"
                        :strokeWidth="5" readonly
                        valueColor="lightblue"/>
                  <div class="text-xs">Total Subject Views</div>
                </div>
              </div>

              <div
                  class="w-full h-8rem lg:pl-3 border-bottom-1 border-gray-300 flex justify-content-center align-items-center fadein animation-duration-1000">
                <div class="text-center font-bold">
                  <Knob v-model="avgSubjectViews"
                        :max="100"
                        :size="80"
                        :strokeWidth="5" readonly
                        valueColor="lightblue"/>
                  <div class="text-xs">Avg. Subject Views</div>
                </div>
              </div>


              <div
                  class="w-full h-8rem lg:pl-3 border-bottom-1 border-gray-300 flex justify-content-center align-items-center fadein animation-duration-1000">
                <div class="text-center font-bold">
                  <Knob v-model="avgSubjectViewsPerClass"
                        :max="100"
                        :size="80"
                        :strokeWidth="5" readonly
                        valueColor="lightpurple"/>
                  <div class="text-xs">Avg. Subject Views Per User</div>
                </div>
              </div>

            </div>
            <!-- subject views -->

            <!-- subject radar -->
            <div class="col-12 md:col-8 lg:col-7 p-0 lg:pl-3 py-3">

              <div class="py-2 text-center">
                <div class="font-bold">subject views analysis</div>
                <div class="text-xs font-light">
                  {{ new Date(start_date).toDateString() }} - {{ new Date(end_date).toDateString() }}
                </div>
              </div>

              <div class="flex justify-content-center">
                <Chart :data="subjectViewsChart"
                       :options="radar_chart_options"
                       type="radar"/>
              </div>

            </div>
            <!-- /subject radar -->

          </div>
          <!-- /subject average -->
        </div>

      </div>
      <!-- /table grid -->

    </div>
    <!-- /left col -->


    <!-- right col -->
    <div class="col-12 md:col-6 p-2 md:p-3 lg:p-4 flex flex-column surface-50 select-none">

      <!-- overall | active item | date -->
      <div
          class="md:h-4rem surface-50 border-bottom-none border-1 border-gray-300 md:flex align-items-center text-xs">
        <!-- active item -->
        <div
            class="md:w-4 h-3rem md:h-full lg:px-3 border-right-1 border-gray-300 flex align-items-center justify-content-center md:justify-content-start">

          <Button v-if="activeItem"
                  :label="active_category==='classes' ? getClassName(activeItem.name) : activeItem.name"
                  class="w-full border-none border-orange-600 capitalize fadein animation-duration-500"
                  icon="pi pi-times"
                  icon-pos="right" rounded
                  severity="warn" size="small"
                  @click="activeItem=null"/>

          <div class="w-full text-center text-sm" v-else>Overall</div>
        </div>

        <!-- dates -->
        <div
            class="md:w-8 h-3rem md:h-full lg:pr-4 flex align-items-center justify-content-center lg:justify-content-end"
            @click="$refs.date_popover.toggle($event);">
          {{ new Date(start_date).toDateString() }} -
          {{ new Date(end_date).toDateString() }}
        </div>

        <!-- date popup -->
        <Popover ref="date_popover">

          <div class="w-16rem lg:w-25rem">

            <div class="md:flex gap-2">
              <div class="py-2">
                <label class="block text-xs text-gray-600" for="start-date-ip">start date</label>
                <Calendar id="start-date-ip" v-model="start_date" fluid placeholder="start date"/>
              </div>

              <div class="py-2">
                <label class="block text-xs text-gray-600 text-right" for="end-date-ip">end date</label>
                <Calendar id="end-date-ip" v-model="end_date" fluid placeholder="end date"/>
              </div>
            </div>

            <div class="py-2 md:pl-2 md:flex justify-content-end">
              <Button class="w-full md:w-6"
                      icon="pi pi-check-circle text-xs"
                      label="update"
                      severity="primary"
                      @click="$refs.date_popover.toggle($event); updatePeriod()"/>
            </div>
          </div>

        </Popover>
        <!-- /date popup -->
      </div>
      <!-- overall | active item | date -->


      <!-- metric data  -->
      <div class="grid m-0 border-1 border-bottom-none border-gray-300 capitalize text-xs">

        <!-- sessions -->
        <div class="col-6 md:col-4 p-0">

          <!-- total sessions -->
          <div
              class="h-8rem lg:pl-3 bg-white border-bottom-1 border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-1000">
            <div class="text-center">
              <div class="text-xl font-bold">{{ totalSessions }}</div>
              <div class="text-xs">Total Sessions</div>
              <div class="text-xs fadein animation-duration-500">{{ active_item_title }}</div>
            </div>
          </div>
          <!-- /total sessions -->

          <!-- Avg. minutes / session -->
          <div
              class="h-8rem lg:pl-3 bg-white border-bottom-1 border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-2000">
            <div class="text-center">
              <div class="text-xl font-bold">{{ avgMinutesPerSession }}</div>
              <div class="text-xs">Avg. minutes / session</div>
              <div class="text-xs fadein animation-duration-500">{{ active_item_title }}</div>
            </div>
          </div>
          <!-- /Avg. minutes / session -->

          <!-- Avg. minutes / class -->
          <div
              class="h-8rem lg:pl-3 bg-white border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-3000">
            <div class="text-center">
              <div class="text-xl font-bold">{{ avgSessionsPerClass }}</div>
              <div class="text-xs">Avg. sessions / class</div>
              <div class="text-xs fadein animation-duration-500">{{ active_item_title }}</div>
            </div>
          </div>
          <!-- /Avg. minutes / class -->

        </div>
        <!-- /sessions -->


        <!-- users -->
        <div class="col-6 md:col-4 p-0">

          <!-- new users -->
          <div
              class="h-8rem lg:pl-3 bg-white border-bottom-1 border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-1000">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ newUsers }}</div>
              <div class="text-xs">+New Users</div>
              <div class="text-xs fadein animation-duration-500">{{ active_item_title }}</div>
            </div>
          </div>
          <!-- /new users -->


          <!-- users per day -->
          <div
              class="h-8rem lg:pl-3 bg-white border-bottom-1 border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-2000">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ dailyUsers }}</div>
              <div class="text-xs">Users / Day</div>
              <div class="text-xs fadein animation-duration-500">{{ active_item_title }}</div>
            </div>
          </div>
          <!-- /users per day -->


          <!-- Users / Week -->
          <div
              class="h-8rem lg:pl-3 bg-white border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-3000">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ weeklyUsers }}</div>
              <div class="text-xs">Users / Week</div>
              <div class="text-xs fadein animation-duration-500">{{ active_item_title }}</div>
            </div>
          </div>
          <!-- /Users / Week -->


        </div>
        <!-- users -->


        <!-- subjects -->
        <div class="col-12 md:col-4 p-0 bg-gray-100">

          <div
              class="w-full h-8rem lg:pl-3 border-bottom-1 border-gray-300 flex justify-content-center align-items-center fadein animation-duration-1000">
            <div class="text-center font-bold">

              <Knob v-model="avgSubjectsPerSession"
                    :max="100"
                    :size="80"
                    :strokeWidth="5" readonly
                    valueColor="lightblue"/>

              <div class="text-xs">Avg. Subjects / Session</div>
              <div class="text-xs">Overall</div>
            </div>
          </div>

          <div
              class="w-full h-8rem lg:pl-3 border-bottom-1 border-gray-300 flex justify-content-center align-items-center fadein animation-duration-2000">
            <div class="text-center">

              <Knob v-model="avgSubjectPerClass"
                    :size="80"
                    :strokeWidth="5" readonly
                    valueColor="limegreen"/>

              <div class="text-xs">Avg. Subjects / User</div>
              <div class="text-xs">Overall</div>
            </div>
          </div>

          <div
              class="w-full h-8rem lg:pl-3 flex justify-content-center align-items-center fadein animation-duration-3000">
            <div class="text-center">

              <Knob v-model="avgSubjectPerSchool"
                    :max="5"
                    :size="80"
                    :strokeWidth="5"
                    readonly
                    valueColor="purple"/>

              <div class="text-xs">Subjects / Region</div>
              <div class="text-xs">Overall</div>
            </div>
          </div>

        </div>
        <!-- subjects -->

      </div>
      <!-- metric data  -->


      <!-- charts -->
      <div class="grid m-0 bg-gray-100 border-1 border-gray-300 text-xs font-bold capitalize">

        <!-- sessionTotal -->
        <div
            class="col-12 md:col-4 p-0 lg:py-3 border-right-1 border-bottom-1 md:border-bottom-none border-gray-300 flex justify-content-center">
          <div class="text-center p-3">
            <div class="capitalize">{{ active_category }} | Overall</div>
            <div class="py-2">Total Sessions</div>
            <div class="w-6">
              <Chart :data="sessionTotalChart"
                     :options="donut_chart_options"
                     class="h-12rem w-12rem md:w-6rem md:h-6rem lg:w-8rem lg:h-8rem"
                     type="doughnut"/>
            </div>
          </div>
        </div>
        <!-- /chart 1 -->


        <!-- Minutes / Session -->
        <div
            class="col-12 md:col-4 p-0 lg:py-3 border-right-1 border-bottom-1 md:border-bottom-none border-gray-300 flex justify-content-center">
          <div class="text-center p-3">
            <div class="capitalize">{{ active_category }} | Overall</div>
            <div class="py-2">Minutes / Session</div>
            <Chart :data="sessionAvgChart"
                   :options="donut_chart_options"
                   class="h-12rem w-12rem md:w-6rem md:h-6rem lg:w-8rem lg:h-8rem"
                   type="doughnut"/>
          </div>
        </div>
        <!-- /chart 2 -->


        <!-- subjects / session chart -->
        <div class="col-12 md:col-4 p-0 lg:py-3 flex justify-content-center">
          <div class="text-center p-3">

            <div class="capitalize">{{ active_category }} | Overall</div>
            <div class="py-2">Subjects / Session</div>

            <Chart :data="subjectsPerSessionChart"
                   :options="donut_chart_options"
                   class="h-12rem w-12rem md:w-6rem md:h-6rem lg:w-8rem lg:h-8rem"
                   type="doughnut"/>
          </div>
        </div>
        <!-- subjects / session knob -->

      </div>
      <!-- /charts -->


      <!-- annual chart -->
      <div class="p-3 border-top-1 border-gray-50 bg-white shadow-1">
        <div class="h-2rem lg:pr-3 text-right text-sm">
          Sessions | {{ new Date().getFullYear() }}
        </div>

        <div class="flex justify-content-center">
          <Chart :data="annualData"
                 :options="annualChartOptions"
                 class="w-full"
                 type="line"/>
        </div>
      </div>
      <!-- annual chart -->

    </div>
    <!-- /right col -->

  </div>
  <!-- /content grid -->
</template>


<script setup lang="js">
useState('entities', () => []);
useState('regions', () => []);
useState('class_types', () => []);
useState('subjects', () => []);
useState('schools', () => []);
useState('classes', () => []);
useState('teachers', () => []);
useState('pupils', () => []);
</script>


<script lang="js">
import {FilterMatchMode} from '@primevue/core/api';

export default defineComponent({

  name: "Dashboard",

  data() {
    return {
      //categories.
      regions : [],
      subjects: [],
      schools : [],
      classes : [],

      sessions    : [], //filtered sessions.
      raw_sessions: [], //unfiltered sessions.
      class_types : [],

      //active.
      active_category: "schools",
      activeItem     : null,

      //date periods.
      start_date: null,
      end_date  : null,

      //table.
      filters  : {
        global: {
          value    : null,
          matchMode: FilterMatchMode.CONTAINS
        },
      },
      filters_1: {
        global: {
          value    : null,
          matchMode: FilterMatchMode.CONTAINS
        },
      },

      //chart options.
      donut_chart_options: {
        animation   : {
          animateScale : true,
          animateRotate: true
        },
        cutout      : '70%',
        borderRadius: 4,
        spacing     : 6,
        plugins     : {
          legend: {display: false}
        },
        scales      : {
          y: {
            display: false,
            grid   : {
              display: false
            }
          },
          x: {
            display: false,
            grid   : {
              display: false
            }
          }
        },
      },
      radar_chart_options: {
        responsive: true,
        animation : {
          animateScale : true,
          animateRotate: true
        },
        plugins   : {
          legend: {display: false}
        },
        scales    : {
          y: {
            display: false,
            grid   : {
              display: false
            }
          },
          x: {
            display: false,
            grid   : {
              display: false
            }
          }
        },
      },
      annualChartOptions : {

        tension            : 0.4,
        borderRadius       : 8,
        spacing            : 2,
        responsive         : true,            // Enable responsiveness
        maintainAspectRatio: false,  // Allow the chart to fill the width (no fixed aspect ratio)

        pointStyle      : 'circle',
        pointRadius     : 10,
        pointHoverRadius: 15,

        plugins: {
          legend: {
            display: false,
          }
        },

      },

      //UI
      is_loading: false,

      //cache.
      cache: {},
    }
  },

  computed: {
    //server url.
    server_url() {
      return useState('server_url').value;
    },

    //active table data.
    tableData() {
      if (this.active_category === 'regions') return this.regions;
      else if (this.active_category === 'schools') return this.schools;
      else if (this.active_category === 'classes') return this.classes;
      else if (this.active_category === 'subjects') return this.subjects;

      return [];
    },

    //start_time
    start_time() {
      return new Date(this.start_date).getTime();
    },

    //end_time
    end_time() {
      return new Date(this.end_date).getTime();
    },

    //get chart display title.
    active_item_title() {

      if (this.activeItem) {
        //return title.
        let title = '';

        //active class.
        if (this.active_category === 'classes') {
          title = this.getClassName(this.activeItem.name);
          if (this.activeItem.school) {
            title += ' | ' + this.getItemNameByID('schools', this.activeItem.school)
          }
        }
        //non-class item
        else title = this.activeItem.name;

        //return.
        return title;
      } //active item.


      return 'overall';
    },

//////////////////////////////////////////////// metrics - sessions.

    //get total sessions.
    totalSessions() {
      return (this.activeItem ? (this.activeItem.sessions || 0) : this.sessions.length);
    },

    //get avg. minutes per session.
    avgMinutesPerSession() {
      //param check.
      if (!this.sessions.length) return 0;

      let total_time = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            Object.keys(session.entries)
                  .map(entry_name => {
                    if (session.entries[entry_name].session_total_time) {
                      total_time += session.entries[entry_name].session_total_time;
                    }
                  });
          });

      //return.
      return Math.ceil(total_time / this.sessions.length);
    },

    //get avg. minutes per session.
    avgSessionsPerClass() {
      //param check.
      if (!this.sessions.length) return 0;

      let total_time = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            Object.keys(session.entries)
                  .map(entry_name => {
                    if (session.entries[entry_name].session_total_time) {
                      total_time += session.entries[entry_name].session_total_time;
                    }
                  });
          });

      //return.
      return Math.ceil(total_time / this.classes.length);
    },

//////////////////////////////////////////////// metrics - users.

    //new users.
    newUsers() {
      const start_time = new Date(this.start_date).getTime();
      const end_time   = new Date(this.end_date).getTime();

      let classes = [];
      //active class.
      if (this.activeItem && this.active_category === 'classes') classes = [this.activeItem];

      //get school classes.
      else if (this.activeItem && this.active_category === 'schools') {
        classes = this.classes.filter(class_ => Number(class_.school) === Number(this.activeItem.id));
      }

      //get region classes.
      else if (this.activeItem && this.active_category === 'regions') {
        const school_ids = this.schools
                               .filter(school => Number(school.regions) === Number(this.activeItem.id))
                               .map(school => Number(school.id));

        classes = this.classes
                      .filter(class_ => school_ids.includes(Number(class_.school)));
      }

      //overall classes.
      else classes = this.classes;

      return classes.filter(class_ => Number(class_.id) >= start_time && Number(class_.id) <= end_time).length;
    },

    //get daily users
    dailyUsers() {
      const start_time = new Date(this.start_date).getTime();
      const end_time   = new Date(this.end_date).getTime();

      //populate sessions.
      let sessions = this.getSessions();

      //get session count.
      let userMap = {};
      sessions
          .filter(session => Number(session.start_time) >= start_time && Number(session.end_time) <= end_time)
          .map(session => userMap[session.class_] = 1);

      const days = (end_time - start_time) / (1000 * 60 * 24);
      return Math.ceil(Object.keys(userMap).length / (days));
    },

    //get daily users
    weeklyUsers() {
      //start & end times init.
      const start_time = new Date(this.start_date).getTime();
      const end_time   = new Date(this.end_date).getTime();


      //populate sessions.
      let sessions = this.getSessions();


      //get session count.
      let userMap = {};
      sessions
          .filter(session => Number(session.start_time) >= start_time && Number(session.end_time) <= end_time)
          .map(session => userMap[session.class_] = 1);

      const weeks = (end_time - start_time) / (1000 * 60 * 24 * 7);
      return Math.ceil(Object.keys(userMap).length / weeks);
    },

/////////////////////////////////////////////// metrics - subjects.

    //average subjects per session.
    avgSubjectsPerSession() {
      let subject_count = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            subject_count += Object.keys(session.entries).length;
          });

      return Math.ceil(subject_count / this.sessions.length)
    },

    //average subjects per class.
    avgSubjectPerClass() {
      let subject_count = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            subject_count += Object.keys(session.entries).length;
          });

      return Math.ceil(subject_count / this.classes.length)
    },

    //average subjects per school.
    avgSubjectPerSchool() {
      let subject_count = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            subject_count += Object.keys(session.entries).length;
          });

      return Math.ceil(subject_count / this.schools.length)
    },


/////////////////////////////////////////////// charts

    //session total.
    sessionTotalChart() {
      //active category items.
      const items           = this[this.active_category].filter(item => item.sessions);
      const active_category = this.active_category;

      return {
        labels  : items.map(item => active_category === 'classes' ? this.getItemNameByID('class_types', item.name) : item.name),
        datasets: [
          {
            data           : items.map(item => Number(item.sessions)),
            backgroundColor: "rgb(183,33,206)"
          }
        ]
      }
    },

    //session average chart.
    sessionAvgChart() {
      //active item.
      const items = this[this.active_category].filter(item => item.session_avg);

      return {
        labels  : items.map(item => this.active_category === 'classes' ? this.getItemNameByID('class_types', item.name) : item.name),
        datasets: [
          {
            data           : items.map(item => Number(item.session_avg)),
            backgroundColor: "rgb(176,255,20)"
          }
        ]
      }
    },

    //session total.
    subjectsPerSessionChart() {

      //active item.
      const items = this[this.active_category].filter(item => item.session_avg);

      return {
        labels  : items.map(item => this.active_category === 'classes' ? this.getItemNameByID('class_types', item.name) : item.name),
        datasets: [
          {
            data           : items.map(item => Number(item.session_avg)),
            backgroundColor: "rgb(72,188,255)"
          }
        ]
      }
    },

    //annual data.
    annualData() {

      //data init.
      let data = [];
      for (let month = 0; month < 12; month++) data[month] = 0;

      this.sessions.forEach(session => {
        const session_month = new Date(Number(session.start_time)).getMonth();
        data[session_month]++;
      })

      return {
        labels  : ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        datasets: [
          {
            data       : data,
            borderColor: 'rgb(96,206,33)'
          }
        ]
      }
    },

    //subject average.
    subjectViewsChart() {
      return {
        labels  : this.subjects.map(subject => subject.name),
        datasets: [
          {
            data           : this.subjects.map(subject => subject.views),
            backgroundColor: "rgb(183,33,206)"
          }
        ]
      }
    },

////////////////////////////////////////////////
    //subject View Average.
    avgSubjectViews() {
      //subject length check.
      if (!this.subjects.length) return 0;

      let views = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            Object.keys(session.entries)
                  .map(entry_name => {
                    views += session.entries[entry_name].views ? session.entries[entry_name].views : 0;
                  })
          });

      return Math.ceil(views / this.subjects.length);
    },

    //subject View Average.
    avgSubjectViewsPerClass() {
      //subject length check.
      if (!this.subjects.length) return 0;

      let views = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            Object.keys(session.entries)
                  .map(entry_name => {
                    views += session.entries[entry_name].views ? session.entries[entry_name].views : 0;
                  })
          });

      return Math.ceil(views / this.classes.length);
    },

    //subject View Total.
    totalSubjectViews() {
      //subject length check.
      if (!this.subjects.length) return 0;

      let views = 0;
      this.sessions.filter(session => session.entries)
          .map(session => {
            Object.keys(session.entries)
                  .map(entry_name => {
                    views += session.entries[entry_name].views ? session.entries[entry_name].views : 0;
                  })
          });

      return views;
    }
  },

  methods: {

    //compute session metrics.
    computeMetrics() {

      this.sessions = this.raw_sessions
                          .filter(session => Number(session.start_time) >= this.start_time && Number(session.end_time) <= this.end_time)

      //classes.
      for (const class_ of this.classes) {
        //get class sessions.
        const class_sessions      = this.sessions
                                        .filter(session => Number(session.class_) === Number(class_.id))
                                        .filter(session => session.start_time && session.end_time);
        //class total sessions
        class_.sessions           = class_sessions.length;
        class_.session_total_time = 0;
        class_.session_avg        = 0;

        //session total time.
        class_sessions.forEach(session => {
          class_.session_total_time += (session.end_time - session.start_time);
        });

        //session avg time
        if (class_.sessions) {
          class_.session_total_time = (class_.session_total_time / (1000 * 60)).toFixed(2);
          class_.session_avg        = (class_.session_total_time / class_sessions.length).toFixed(2);
        }
      }

      //schools.
      for (const school of this.schools) {
        //get school classes.
        const school_classes = this.classes
                                   .filter(class_ => Number(class_.sessions))
                                   .filter(class_ => Number(class_.school) === Number(school.id));

        //school sessions.
        school.classes  = school_classes.length;
        school.sessions = 0;
        school_classes.map(class_ => school.sessions += class_.sessions);

        //session total time | session avg time.
        school.session_total_time = 0;
        school.session_avg        = 0;

        school_classes.filter(class_ => Number(class_.session_total_time) && Number(class_.session_avg))
                      .forEach(class_ => {
                        school.session_total_time += Number(class_.session_total_time);
                        school.session_avg += Number(class_.session_avg);
                      });

        //session_total_time | session_avg.
        if (school.classes) {
          school.session_total_time = (school.session_total_time / school.classes).toFixed(2);
          school.session_avg        = (school.session_avg / school.classes).toFixed(2);
        }
      }

      //regions.
      for (const region of this.regions) {
        //get region schools.
        const region_schools = this.schools
                                   .filter(school => Number(school.sessions))
                                   .filter(school => Number(school.regions) === Number(region.id));

        //region sessions.
        region.schools  = region_schools.length;
        region.sessions = 0;
        region_schools.map(school => region.sessions += school.sessions);

        //session total time | session avg time.
        region.session_total_time = 0;
        region.session_avg        = 0;

        region_schools.filter(school => Number(school.session_total_time) && Number(school.session_avg))
                      .forEach(school => {
                        region.session_total_time += Number(school.session_total_time);
                        region.session_avg += Number(school.session_avg);
                      });

        //session_total_time | session_avg.
        if (region.schools) {
          region.session_total_time = (region.session_total_time / region.schools).toFixed(2);
          region.session_avg        = (region.session_avg / region.schools).toFixed(2);
        }
      }

      //subjects.
      this.subjects  = [];
      let subjectMap = {};

      //populate subjectMap.
      this.sessions.filter(session => session.entries)
          .forEach(session => {
            const entry_names = Object.keys(session.entries);

            entry_names.forEach(entry_name => {
              //new entry.
              if (!subjectMap[entry_name]) {
                const entry = session.entries[entry_name];
                if (entry.session_total_time && entry.views) {
                  subjectMap[entry_name]          = session.entries[entry_name];
                  subjectMap[entry_name].sessions = 1;
                }
              }
              //update entry.
              else {
                //get entry.
                const entry = session.entries[entry_name];
                if (entry.session_total_time && entry.views) {
                  //update total time.
                  if (!subjectMap[entry_name].session_total_time) subjectMap[entry_name].session_total_time = 0;
                  subjectMap[entry_name].session_total_time += entry.session_total_time;
                  subjectMap[entry_name].session_total_time = (Math.ceil(subjectMap[entry_name].session_total_time / (1000 * 60)))

                  //update views.
                  if (!subjectMap[entry_name].views) subjectMap[entry_name].views = 0;
                  subjectMap[entry_name].views += entry.views;

                  //update session count.
                  subjectMap[entry_name].sessions++;
                }
              } //update entry.


              if (subjectMap[entry_name]) { //minutes per session.
                subjectMap[entry_name].session_total_time = Math.ceil((subjectMap[entry_name].session_total_time) / (1000 * 60));

                const total_time     = subjectMap[entry_name].session_total_time;
                const total_sessions = subjectMap[entry_name].sessions;

                //session avg.
                subjectMap[entry_name].session_avg = (Math.ceil(total_time / total_sessions));
              }

            });
          });

      //populate subjects.
      Object.keys(subjectMap)
            .map(entry_name => this.subjects.push(subjectMap[entry_name]));


    },


    //get item count.
    getItemCount(cat_name) {
      return this[cat_name].length;
    },


    //get className.
    getClassName(class_type_id) {
      const class_type = this.class_types.find(class_type => Number(class_type.id) === Number(class_type_id));
      if (class_type) return class_type.name;
      else return '-';
    },


    //get className.
    getItemNameByID(cat_name, item_id) {
      //params check.
      if (!cat_name && item_id) return null;

      //get item.
      const item = this[cat_name].find(item => Number(item.id) === Number(item_id));

      //return.
      return item ? item.name : '-';
    },


    //get sessions filtered by active category..
    getSessions() {
      //populate sessions.
      let sessions = [];

      //session filter by active school.
      if (this.activeItem && this.active_category === 'schools') {
        sessions = this.sessions.filter(session_ => Number(session_.school) === Number(this.activeItem.id));
      }
      //session filter by active class.
      else if (this.activeItem && this.active_category === 'classes') {
        sessions = this.sessions.filter(session_ => Number(session_.class_) === Number(this.activeItem.id));
      }
      //session filter by active region.
      else if (this.activeItem && this.active_category === 'regions') {
        const region_id  = Number(this.activeItem.id);
        const school_ids = this.schools.filter(school => Number(school.regions) === region_id)
                               .map(school => Number(school.id));
        sessions         = this.sessions
                               .filter(session_ => school_ids.includes(Number(session_.school)));
      }
      //overall sessions.
      else sessions = this.sessions

      return sessions;
    },


    //table row style.
    rowClass(data) {
      if (this.activeItem === data) return 'bg-orange-600 text-white font-bold';
    },


    //update active period.
    updatePeriod() {
      this.computeMetrics();
      this.notify('period', 'active period updated', 'info');
    },


    //notify.
    notify(title, details, severity) {
      this.$toast.add({
        severity: severity || 'info',
        summary : title || 'Update',
        detail  : details || 'Successful',
        life    : 2000
      });
    },


    //loadItems.
    async loadItems(cat_name) {
      try {
        this.is_loading = true;
        const items     = await $fetch(this.server_url + (cat_name));
        this.is_loading = false;

        //return.
        return items;
      }

          //client load error.
      catch (e) {
        //stop load | notify.
        this.is_loading = false;
        this.notify('Load Error', 'Unable to load items', 'warn');
      }
    },


    //load UI.
    async loadUI() {

      //UI reset.
      this.activeItem = null;

      //set dates.
      const current_month = new Date().getMonth() + 1;
      const current_year  = new Date().getFullYear();
      this.start_date     = new Date(current_year, current_month - 1, 1);
      this.end_date       = new Date(current_year, current_month, 0);

      //fetch categories.
      for (const cat_name of ['sessions', 'regions', 'subjects', 'schools', 'classes', 'class_types']) {
        if (cat_name === 'sessions') this.raw_sessions = await this.loadItems(cat_name)
        else this[cat_name] = await this.loadItems(cat_name)
      }

      //compute metrics.
      this.computeMetrics();

    }
  },

  async beforeMount() {
    await this.loadUI();
  },

})
</script>


<style scoped>
svg > text {
  fill: white !important;
}
</style>