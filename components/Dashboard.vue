<template>
  <!-- content grid -->
  <div class="grid m-0 bg-gray-100 text-gray-700 fadein animation-duration-500 select-none">

    <!-- left col -->
    <div class="col-12 md:col-6 p-2 md:p-3 lg:p-4">

      <!-- categories header -->
      <div class="grid m-0 bg-white border-1 border-gray-200 capitalize">

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
              :loading="is_loading"
              :sort-order="-1"
              :value="tableData"
              class="border-right-1 border-left-1 border-gray-200 text-xs"
              data-key="id" paginator
              row-hover size="large" striped-rows>

            <template #header>
              <div class="p-3 md:flex justify-content-between align-items-center">

                <div
                    class="w-full md:w-8 pb-2 lg:py-1 flex align-items-center justify-content-between md:justify-content-start gap-3">
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-search"/>
                    </InputIcon>
                    <InputText v-model="filters['global'].value" fluid
                               placeholder="Search"
                               class="border-round-2xl"
                               size="small"/>
                  </IconField>
                  <Button :loading="is_loading"
                          icon="pi pi-refresh" outlined rounded raised
                          class="border-1 border-gray-300"
                          severity="secondary" size="small"
                          @click="loadUI"/>
                </div>

                <div v-if="activeItem" class="pt-3 lg:p-0 lg:text-right">
                  <Button v-if="activeItem"
                          :label="active_category==='classes' ? getClassName(activeItem.name) : activeItem.name"
                          class="border-1 border-orange-600 capitalize fadein animation-duration-500"
                          icon="pi pi-times"
                          icon-pos="right" outlined raised
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

                <!-- rating -->
                <div v-if="['classes', 'schools', 'subjects'].includes(active_category)" class="flex">
                  <Rating v-if="active_category==='schools'"
                          :model-value="getSchoolRating(data.id)"
                          :stars="5"
                          class="text-yellow-500 flex gap-1 text-xs"
                          readonly unstyled/>

                  <Rating v-if="active_category==='classes'"
                          :model-value="getClassRating(data.id)"
                          :stars="5"
                          class="text-yellow-500 flex gap-1 text-xs"
                          readonly unstyled/>

                  <Rating v-if="active_category==='subjects'"
                          :model-value="getSubjectRating(data.name)"
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
                          class="hover:shadow-2 border-1 border-gray-300" size="small"
                          icon="pi pi-chart-line" rounded raised
                          severity="secondary"
                          @click="activeItem=data"/>
                </div>
              </template>
            </Column>


          </DataTable>

          <!-- subject average -->
          <div class="grid m-0 surface-100 border-1 border-gray-300 capitalize">

            <!-- subject views -->
            <div class="col-12 md:col-4 lg:col-5 p-0 flex md:flex-column border-right-1 border-gray-300 text-xs">

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
        <div class="md:w-8 p-4 hover:shadow-2" @click="$refs.date_popover.toggle($event);">
          {{ new Date(start_date).toDateString() }} - {{ new Date(end_date).toDateString() }}
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
              <div class="text-xs fadein animation-duration-500">{{ metric_title }}</div>
            </div>
          </div>
          <!-- /total sessions -->

          <!-- Avg. minutes / session -->
          <div
              class="h-8rem lg:pl-3 bg-white border-bottom-1 border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-2000">
            <div class="text-center">
              <div class="text-xl font-bold">{{ avgMinutesPerSession }}</div>
              <div class="text-xs">Avg. minutes / session</div>
              <div class="text-xs fadein animation-duration-500">{{ metric_title }}</div>
            </div>
          </div>
          <!-- /Avg. minutes / session -->

          <!-- Avg. minutes / class -->
          <div
              class="h-8rem lg:pl-3 bg-white border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-3000">
            <div class="text-center">
              <div class="text-xl font-bold">{{ avgSessionsPerClass }}</div>
              <div class="text-xs">Avg. sessions / class</div>
              <div class="text-xs fadein animation-duration-500">{{ metric_title }}</div>
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
              <div class="text-xs fadein animation-duration-500">
                <template v-if="activeItem && ['schools', 'regions'].includes(active_category)">
                  {{ activeItem.label || activeItem.name }}
                </template>
                <template v-else>Overall</template>
              </div>
            </div>
          </div>
          <!-- /new users -->


          <!-- users per day -->
          <div
              class="h-8rem lg:pl-3 bg-white border-bottom-1 border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-2000">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ dailyUsers }}</div>
              <div class="text-xs">Users / Day</div>
              <div class="text-xs fadein animation-duration-500">{{ metric_title }}</div>
            </div>
          </div>
          <!-- /users per day -->


          <!-- Users / Week -->
          <div
              class="h-8rem lg:pl-3 bg-white border-right-1 border-gray-200 flex justify-content-center align-items-center fadein animation-duration-3000">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ weeklyUsers }}</div>
              <div class="text-xs">Users / Week</div>
              <div class="text-xs fadein animation-duration-500">{{ metric_title }}</div>
            </div>
          </div>
          <!-- /Users / Week -->


        </div>
        <!-- users -->


        <!-- subjects -->
        <div class="col-12 md:col-4 p-0 flex md:flex-column bg-gray-100">

          <div
              class="w-full h-8rem lg:pl-3 border-bottom-1 border-gray-300 flex justify-content-center align-items-center fadein animation-duration-1000">
            <div class="text-center font-bold">

              <Knob v-model="avgSubjectsPerSession"
                    :max="100"
                    :size="80"
                    :strokeWidth="5" readonly
                    valueColor="lightblue"/>

              <div class="text-xs">Avg. Subjects / Session</div>
              <div class="text-xs">{{ metric_title }}</div>
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
              <div class="text-xs">{{ metric_title }}</div>
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

              <div class="text-xs">Subjects / School</div>
              <div class="text-xs">
                <template v-if="activeItem && active_category === 'schools'">
                  {{ activeItem.name }}
                </template>
                <template v-else>Overall</template>
              </div>
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


//////////////////////////////////////////////// CHART DISPLAY.
    metric_title() {
      if (this.activeItem) {
        //item name | title.
        let title = this.activeItem.name || this.activeItem.title;

        //active class.
        if (this.active_category === 'classes') {
          title = this.getClassName(this.activeItem.name);
          title += ' | ' + this.getItemNameByID('schools', this.activeItem.school)
        }

        //return.
        return title;
      } //active item.

      return 'overall';
    },
//////////////////////////////////////////////// CHART DISPLAY.


//////////////////////////////////////////////// METRICS - SESSIONS.
    //get total sessions.
    totalSessions() {
      if (this.activeItem) return (this.activeItem.sessions || 0);
      else return this.sessions.length;
    },

    //get avg. minutes per session.
    avgMinutesPerSession() {
      //sessions check.
      if (!this.sessions.length) return 0.00;

      let classes = this.classes;

      ////////////////////// active item.
      if (this.activeItem) {
        //active item id cast.
        const item_id = Number(this.activeItem.id);

        //////////////////// active class.
        if (this.active_category === 'classes') classes = [this.activeItem];

        //////////////////// active school.
        else if (this.active_category === 'schools') classes = this.getClassesBySchoolID(item_id);

        //////////////////// active class.
        else if (this.active_category === 'region') classes = this.getClassesByRegionID(item_id);
      } ////////////////////// active item.


      //compute total minutes.
      let total_minutes = 0;
      let class_ids     = [];
      classes.forEach(class_ => {
        total_minutes += Number(class_.session_total_time);
        class_ids.push(Number(class_.id));
      });
      if (!total_minutes) return 0.00;

      //sessions.
      const sessions = this.sessions
                           .filter(session => class_ids.includes(Number(session.class_)));
      if (!sessions.length) return 0.00;

      //return.
      return (total_minutes / sessions.length).toFixed(2);
    },

    //get avg. minutes per session.
    avgSessionsPerClass() {
      //sessions & classes check.
      if (!this.sessions.length) return 0;

      let classes = this.classes;

      if (this.activeItem) {
        if (this.active_category === 'schools') {
          classes = this.getClassesBySchoolID(this.activeItem.id);
        }

        else if (this.active_category === 'regions') {
          classes = this.getClassesByRegionID(this.activeItem.id);
        }
      }
      if (!classes.length) return 0.00;

      //sessions.
      const class_ids = classes.map(class_ => Number(class_.id));
      const sessions  = this.sessions
                            .filter(session => class_ids.includes(Number(session.class_)));
      if (!sessions.length) return 0.00;


      //return.
      return (sessions.length / class_ids.length).toFixed(2);
    },
//////////////////////////////////////////////// METRICS - SESSIONS.

    //new users - overall school & regions.
    newUsers() {
      //global classes.
      if (!this.classes.length) return 0;

      let classes = this.classes;

      //active school | region.
      if (this.activeItem) {
        if (this.active_category === 'schools') classes = this.getClassesBySchoolID(this.activeItem.id);
        else if (this.active_category === 'regions') classes = this.getClassesByRegionID(this.activeItem.id);
      }

      //return.
      return classes
          .filter(class_ => Number(class_.id) >= this.start_time && Number(class_.id) <= this.end_time).length;
    },

    //get daily users
    dailyUsers() {
      if (!this.sessions) return 0;
      let sessions = this.sessions;

      //days.
      const days = (this.end_time - this.start_time) / (1000 * 60 * 24);

      //active item.
      if (this.activeItem) {
        let classes = [];

        if (this.active_category === 'schools') classes = this.getClassesBySchoolID(this.activeItem.id);
        else if (this.active_category === 'regions') classes = this.getClassesByRegionID(this.activeItem.id);

        else if (this.active_category === 'subjects') {
          sessions = this.sessions
                         .filter(session => session.entries)
                         .filter(session => session.entries[this.activeItem.name]);
          if (!sessions.length) return 0;

          //return.
          return Math.ceil(sessions.length / days);
        }

        if (!classes.length) return 0;

        //update sessions.
        const class_ids = classes.map(class_ => Number(class_.id));
        sessions        = this.getSessionsByClassIDs(class_ids)
      }

      //no sessions.
      if (!sessions.length) return 0;

      //return.
      return Math.ceil(sessions.length / days);
    },

    //get weekly users
    weeklyUsers() {
      if (!this.sessions) return 0;
      let sessions = this.sessions;

      //weeks.
      const weeks = (this.end_time - this.start_time) / (1000 * 60 * 24 * 7);

      //active item.
      if (this.activeItem) {
        let classes = [];

        if (this.active_category === 'schools') classes = this.getClassesBySchoolID(this.activeItem.id);
        else if (this.active_category === 'regions') classes = this.getClassesByRegionID(this.activeItem.id);
        else if (this.active_category === 'subjects') {
          sessions = this.sessions
                         .filter(session => session.entries)
                         .filter(session => session.entries[this.activeItem.name]);
          if (!sessions.length) return 0;

          //return.
          return Math.ceil(sessions.length / weeks);
        }

        if (!classes.length) return 0;

        //update sessions.
        const class_ids = classes.map(class_ => Number(class_.id));
        sessions        = this.getSessionsByClassIDs(class_ids)
      }

      //no sessions.
      if (!sessions.length) return 0;

      //return.
      return Math.ceil(sessions.length / weeks);
    },

/////////////////////////////////////////////// metrics - subjects.

    //average subjects per session.
    avgSubjectsPerSession() {
      if (!this.sessions.length || !this.classes.length) return 0;

      let sessions = this.sessions;
      let classes  = this.classes;

      //active item.
      if (this.activeItem) {
        //schools.
        if (this.active_category === 'schools') {
          classes = this.getClassesBySchoolID(this.activeItem.id);
        }

        //regions.
        else if (this.active_category === 'regions') {
          classes = this.getClassesByRegionID(this.activeItem.id);
        }

        //classes.
        else if (this.active_category === 'classes') {
          //active class.
          classes = [this.activeItem];
        } //classes.

        //empty classes.
        if (!classes.length) return 0;

        //update sessions.
        const class_ids = classes.map(class_ => Number(class_.id));
        sessions        = this.getSessionsByClassIDs(class_ids);
        if (!sessions.length) return 0;
      }

      //subject count.
      let subject_count = this.getSessionsSubjectCount(sessions);
      if (!subject_count) return 0;

      //return.
      return Math.ceil(subject_count / sessions.length);
    },

    //average subjects per class.
    avgSubjectPerClass() {
      if (!this.classes.length) return 0;

      //classes.
      let classes = this.classes;

      //active item.
      if (this.activeItem) {
        //schools.
        if (this.active_category === 'schools') {
          classes = this.getClassesBySchoolID(this.activeItem.id);
        }

        //regions.
        else if (this.active_category === 'regions') {
          classes = this.getClassesByRegionID(this.activeItem.id);
        }

        //classes.
        else if (this.active_category === 'classes') {
          const class_id = Number(this.activeItem.id);
          return this.getSessionsSubjectCount(this.getSessionsByClassID(class_id));
        }
        //empty classes.
        if (!classes.length) return 0;
      }

      //class IDs.
      const class_ids = classes.map(class_ => Number(class_.id));
      const sessions  = this.getSessionsByClassIDs(class_ids);
      if (!sessions.length) return 0;


      //get subject count.
      let subject_count = this.getSessionsSubjectCount(sessions);
      if (!subject_count) return 0;

      //return.
      return Math.ceil(subject_count / classes.length);
    },

    //average subjects per school.
    avgSubjectPerSchool() {
      if (!this.schools.length || !this.sessions.length) return 0;

      //sessions init.
      let sessions = this.sessions;
      let schools  = this.schools;

      //active school selected.
      if (this.active_category === 'schools' && this.activeItem) {
        sessions = this.getSchoolSessions(this.activeItem.id);
        schools  = [this.activeItem];
      } //active school selected.

      //global subjects / school.
      const subject_count = this.getSessionsSubjectCount(sessions);
      if (!subject_count) return 0;

      //return.
      return Math.ceil(subject_count / schools.length);
    },


/////////////////////////////////////////////// charts
    //session total chart.
    sessionTotalChart() {
      //active category items.
      const items           = this[this.active_category].filter(item => item.sessions);
      const active_category = this.active_category;

      //data init.
      let labels = [];
      let data   = [];
      items.map(item => {
        //labels.
        const item_name = active_category === 'classes' ? this.getClassName(item.name) : item.name;
        labels.push(item_name);
        data.push(item.sessions);
      });

      return {
        labels  : labels,
        datasets: [
          {
            data           : data,
            backgroundColor: "rgb(183,33,206)"
          }
        ]
      }
    },

    //session average chart.
    sessionAvgChart() {
      //active category items.
      const items = this[this.active_category]
          .filter(item => item.subject_avg);

      const active_category = this.active_category;

      //data init.
      let labels = [];
      let data   = [];
      items.map(item => {
        //labels.
        const item_name = active_category === 'classes' ? this.getClassName(item.name) : item.name;
        labels.push(item_name);
        data.push(item.session_avg);
      });

      return {
        labels  : labels,
        datasets: [
          {
            data           : data,
            backgroundColor: "rgb(183,33,206)"
          }
        ]
      }

    },

    //session total.
    subjectsPerSessionChart() {

      //data init.
      let labels = [];
      let data   = [];

      const active_category = this.active_category;

      //active item.
      this[active_category]
          .filter(item => item.subject_avg)
          .forEach(item => {
            //labels | data.
            const item_name = active_category === 'classes' ? this.getClassName(item.name) : item.name;
            labels.push(item_name);
            data.push(item.subject_avg);
          });

      return {
        labels  : labels,
        datasets: [
          {
            data           : data,
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
//////////////////////////////////////////// RATINGS.
    //get subject rating.
    getSubjectRating(subject_name) {
      //no sessions.
      if (!this.sessions.length) return 0;

      //calculate subject session rating.
      const subject_sessions = this.sessions
                                   .filter(session => session.entries)
                                   .filter(session => session.entries[subject_name]);
      if (!subject_sessions.length) return 0;

      //return rating.
      return Math.ceil(subject_sessions.length * 5 / this.sessions.length);
    },

    //get class rating.
    getClassRating(class_id) {
      //no sessions.
      if (!this.sessions.length) return 0;

      //calculate class session rating.
      const class_sessions = this.sessions.filter(session => Number(session.class_) === Number(class_id));
      if (!class_sessions.length) return 0;

      //return rating.
      return Math.ceil(class_sessions.length * 5 / this.sessions.length);
    },

    //get school rating.
    getSchoolRating(school_id) {
      //no sessions.
      if (!this.sessions.length) return 0;

      //calculate school session rating.
      const school_sessions = this.sessions.filter(session => Number(session.school) === Number(school_id));
      if (!school_sessions.length) return 0;

      //return rating.
      return Math.ceil(school_sessions.length * 5 / this.sessions.length);
    },
//////////////////////////////////////////// RATINGS.


//////////////////////////////////////////// CLASSES.
    //get classname based on class_type_id || class name.
    getClassName(class_type_id) {
      const class_type = this.class_types.find(class_type => Number(class_type.id) === Number(class_type_id));
      return class_type ? class_type.name : '-';
    },

    //get classes based on school id.
    getClassesBySchoolID(school_id) {
      if (!school_id) return [];

      //cast.
      school_id = Number(school_id);

      //return.
      return this.classes
                 .filter(class_ => Number(class_.school) === school_id);
    },

    //get classes based on region id.
    getClassesByRegionID(region_id) {
      if (!region_id) return [];

      //cast.
      region_id = Number(region_id);

      //fetch schools ids.
      const school_ids = this.getSchool_IDSByRegionID(region_id);

      //return.
      return this.classes
                 .filter(class_ => school_ids.includes(Number(class_.school)));
    },
//////////////////////////////////////////// CLASSES.


//////////////////////////////////////////// SESSIONS.
    //get sessions from class id.
    getSessionsByClassID(class_id) {
      if (!class_id) return [];

      //cast.
      class_id = Number(class_id);

      //return.
      return this.sessions.filter(session => Number(session.class_) === class_id)
    },

    //get sessions by class ids.
    getSessionsByClassIDs(class_ids) {
      if (!class_ids) return [];

      return this.sessions
                 .filter(session => class_ids.includes(Number(session.class_)));
    },

    //get sessions filtered by active category.
    getSessions(category_name = this.active_category, item_id) {

      //no active item.
      if (!this.activeItem && !item_id) return this.sessions;

      //cast | set default active item id.
      if (item_id) item_id = Number(item_id);
      else item_id = Number(this.activeItem.id);

      /////////// ACTIVE SCHOOL.
      if (category_name === 'schools') {
        return this.sessions.filter(session => Number(session.school) === item_id);
      }

      /////////// ACTIVE CLASS.
      else if (category_name === 'classes') {
        return this.sessions.filter(session => Number(session.class_) === item_id);
      }

      /////////// ACTIVE SUBJECT.
      else if (category_name === 'subjects') return this.getSubjectSessions(this.activeItem.name);

      /////////// ACTIVE REGION.
      else if (category_name === 'regions') {
        const region_id  = Number(this.activeItem.id);
        const school_ids = this.getSchool_IDSByRegionID(region_id);
        return this.sessions
                   .filter(session_ => school_ids.includes(Number(session_.school)));
      }

      //return.
      return [];
    },

    //get session subject count.
    getSessionsSubjectCount(sessions = this.sessions) {
      if (!sessions.length) return 0;

      let subjectMap = {};
      sessions.filter(session => session.entries)
              .map(session => {
                Object.keys(session.entries).forEach(subject_name => {
                  subjectMap[subject_name] = 1;
                })
              });

      //return count.
      return Object.keys(subjectMap).length;
    },
//////////////////////////////////////////// SESSIONS.


//////////////////////////////////////////// ITEMS.
    //get item count.
    getItemCount(cat_name) {
      return this[cat_name].length;
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
//////////////////////////////////////////// ITEMS.


//////////////////////////////////////////// SCHOOLS.
    //get region school ids.
    getSchool_IDSByRegionID(region_id) {
      //region ID check.
      if (!region_id) return [];

      //cast.
      region_id = Number(region_id);

      //return.
      return this.schools.filter(school => Number(school.regions) === region_id)
                 .map(school => Number(school.id));
    },

    //get school sessions.
    getSchoolSessions(school_id) {
      if (!school_id) return [];

      //cast.
      school_id       = Number(school_id);
      const classes   = this.getClassesBySchoolID(school_id);
      const class_ids = classes.map(class_ => Number(class_.id));
      if (!class_ids.length) return [];

      //return.
      return this.sessions.filter(session => class_ids.includes(Number(session.class_)));
    },
//////////////////////////////////////////// SCHOOLS.


//////////////////////////////////////////// GLOBAL.
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

    //compute session metrics.
    computeMetrics() {
      //sessions time filter.
      this.sessions = this.raw_sessions
                          .filter(session => Number(session.start_time) >= this.start_time && Number(session.end_time) <= this.end_time)

      //classes.
      for (const class_ of this.classes) {
        //session data init.
        class_.session_total_time = 0;
        class_.session_avg        = 0;

        //get class sessions.
        const class_sessions = this.getSessions('classes', class_.id);
        class_.sessions      = class_sessions.length;
        if (!class_.sessions) continue;

        //subject avg.
        const subject_count = this.getSessionsSubjectCount(class_sessions);
        if (subject_count) class_.subject_avg = (subject_count / class_.sessions).toFixed(2);

        //session total time.
        class_sessions.forEach(session => {
          class_.session_total_time += (session.end_time - session.start_time);
        });
        if (!class_.session_total_time) continue;

        //session_total_time | session_avg.
        class_.session_total_time = (class_.session_total_time / (1000 * 60)).toFixed(2);
        class_.session_avg        = (class_.session_total_time / class_.sessions).toFixed(2);
      }

      //schools.
      for (const school of this.schools) {
        //session total time | session avg time.
        school.sessions           = 0;
        school.session_total_time = 0;
        school.session_avg        = 0;
        school.subject_avg        = 0;

        //school id | get school classes..
        const school_id      = Number(school.id);
        const school_classes = this.classes.filter(class_ => Number(class_.school) === school_id);
        school.classes       = school_classes.length;
        if (!school_classes.length) continue;


        //compute session_total_time | session_avg | sessions.
        school_classes.forEach(class_ => {
          school.sessions += class_.sessions;
          school.session_total_time += Number(class_.session_total_time);
          school.session_avg += Number(class_.session_avg);
          school.subject_avg += Number(class_.subject_avg);
        });

        //session_total_time | session_avg.
        school.session_total_time = (school.session_total_time / school.classes).toFixed(2);
        school.session_avg        = (school.session_avg / school.classes).toFixed(2);


        //subject avg.
        if (!school.subject_avg) continue;
        school.subject_avg = (school.subject_avg / school.classes).toFixed(2);
      }

      //regions.
      for (const region of this.regions) {
        //session total time | session avg time.
        region.session_total_time = 0;
        region.session_avg        = 0;
        region.subject_avg        = 0;
        region.sessions           = 0;

        //get region schools.
        const region_schools = this.schools
                                   .filter(school => Number(school.regions) === Number(region.id));
        region.schools       = region_schools.length;
        if (!region.schools) continue;

        //sessions | total_time | session_avg.
        region_schools.forEach(school => {
          region.sessions += school.sessions
          region.session_total_time += Number(school.session_total_time);
          region.session_avg += Number(school.session_avg);
          region.subject_avg += Number(school.subject_avg);
        });

        //session_total_time | session_avg.
        region.session_total_time = (region.session_total_time / region.schools).toFixed(2);
        region.session_avg        = (region.session_avg / region.schools).toFixed(2);


        //subject avg.
        if (!region.subject_avg) continue;
        region.subject_avg = (region.subject_avg / region.schools).toFixed(2);
      }


      //subjects.
      this.subjects  = [];
      let subjectMap = {};

      //populate subjectMap.
      this.sessions.filter(session => session.entries)
          .forEach(session => {
            //get entry names.
            const entry_names = Object.keys(session.entries);
            entry_names.forEach(entry_name => {
              //new entry.
              if (!subjectMap[entry_name]) {
                subjectMap[entry_name]          = session.entries[entry_name];
                subjectMap[entry_name].sessions = 1;
              } //new entry.

              //update entry.
              else {
                //entry session increment.
                subjectMap[entry_name].sessions++;

                //get entry.
                const entry = session.entries[entry_name];
                if (entry.session_total_time && entry.views) {
                  //update total time.
                  if (!subjectMap[entry_name].session_total_time) subjectMap[entry_name].session_total_time = 0;
                  subjectMap[entry_name].session_total_time += Math.ceil(entry.session_total_time * (1000 * 60));

                  //update views.
                  if (!subjectMap[entry_name].views) subjectMap[entry_name].views = 0;
                  subjectMap[entry_name].views += entry.views;
                } //entry.
              } //update entry.

              //minutes per session.
              subjectMap[entry_name].session_total_time = Math.ceil((subjectMap[entry_name].session_total_time) / (1000 * 60));

              const total_time     = subjectMap[entry_name].session_total_time;
              const total_sessions = subjectMap[entry_name].sessions;

              //session avg.
              subjectMap[entry_name].session_avg = (Math.ceil(total_time / total_sessions).toFixed(2));
            });
          });

      //populate subjects.
      Object.keys(subjectMap)
            .map(entry_name => this.subjects.push(subjectMap[entry_name]));
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
//////////////////////////////////////////// GLOBAL.


//////////////////////////////////////////// SUBJECTS.
    //get subject sessions.
    //get subject sessions.
    getSubjectSessions(subject_name) {
      //subject name check.
      if (!subject_name) return [];

      //return subject sessions.
      return this.sessions
                 .filter(session_ => session_.entries)
                 .filter(session_ => session_.entries[subject_name]);
    },

//////////////////////////////////////////// SUBJECTS.


//////////////////////////////////////////// PERIOD.
    //update active period.
    updatePeriod() {
      this.computeMetrics();
      this.notify('period', 'active period updated', 'info');
    },
//////////////////////////////////////////// PERIOD.


//////////////////////////////////////////// TABLE DISPLAY.
    //table row style.
    rowClass(data) {
      if (this.activeItem === data) return 'bg-orange-600 text-white font-bold';
    },
//////////////////////////////////////////// TABLE DISPLAY.
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