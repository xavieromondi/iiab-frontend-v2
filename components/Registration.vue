<template>

  <!-- content grid -->
  <div class="grid m-0 pt-2 lg:p-4 text-gray-700 fadein animation-duration-500 select-none">

    <!-- left col -->
    <div class="col-12 md:col-7 p-3 lg:pt-0">

      <!-- header -->
      <div class="grid m-0 bg-gray-50 border-bottom-none border-1 border-gray-200 flex capitalize text-xs">

        <!-- management mode -->
        <template v-if="mode==='management'">
          <div v-for="(entity_, ix) in entities.filter(item => !item.config)"
               :class="`col h-4rem pl-3 flex align-items-center hover:shadow-2 lg:border-top-none ${ix>1 ? 'border-top-1 border-gray-200' : ''} ${ix===1 ? 'lg:border-right-1 border-gray-200' : ''} ${ [0, 2].includes(ix) ? 'border-right-1 border-gray-200' : ''}  ${entity===entity_ ? 'bg-orange-600 text-white' : ''}`"
               @click="switchEntity(entity_)">

            <div>
              <div class="text-2xl">{{ entity_.data.length }}</div>
              <div class="flex align-items-center gap-2">
                <i :class="`${entity_.icon} text-xs`"/> {{ entity_.label }}
              </div>
            </div>

          </div>
        </template>
        <!-- /management mode -->


        <!-- config mode -->
        <template v-if="mode==='config'">
          <div v-for="(entity_, ix) in entities.filter(item => item.config)"
               :class="`col h-4rem pl-3 flex align-items-center hover:shadow-2 lg:border-top-none ${ix>1 ? 'border-top-1 border-gray-200' : ''} ${ix===1 ? 'lg:border-right-1 border-gray-200' : ''} ${ [0, 2].includes(ix) ? 'border-right-1 border-gray-200' : ''}  ${entity===entity_ ? 'bg-orange-600 text-white' : ''}`"
               @click="switchEntity(entity_)">

            <div>
              <div class="text-2xl">{{ entity_.data.length }}</div>
              <div class="flex align-items-center gap-2">
                <i :class="`${entity_.icon} text-xs`"/> {{ entity_.label }}
              </div>
            </div>

          </div>
        </template>
        <!-- /config mode -->

      </div>
      <!-- /header -->


      <!-- table -->
      <DataTable
          v-model:filters="filters"
          :globalFilterFields="['name', 'username', 'teacher_id', 'school_id']"
          :row-class="rowClass"
          :rows="5"
          :value="tableData"
          class="border-1 border-gray-200 text-sm"
          data-key="id" paginator
          row-hover size="" striped-rows>

        <template #header>
          <div class="p-3">

            <!-- mode toggle | search -->
            <div class="flex align-items-center justify-content-between">
              <!-- search -->
              <IconField>
                <InputIcon>
                  <i class="pi pi-search"/>
                </InputIcon>
                <InputText id="search-ip" v-model="filters['global'].value" class="border-round-2xl" size="small"
                           fluid/>
              </IconField>
              <!-- /search -->

              <div class="w-7 pr-2 flex gap-3 justify-content-end">
                <!-- mode toggle -->
                <Button :icon="mode==='config' ? 'pi pi-cog' : 'pi pi-th-large'"
                        :outlined="mode!=='config'" rounded raised
                        severity="warn" size="small"
                        @click="switchMode()"/>

                <!-- reload -->
                <Button :loading="is_loading"
                        icon="pi pi-refresh" outlined rounded raised
                        severity="primary" size="small"
                        @click="loadItems()"/>
              </div>
            </div>
            <!-- /mode toggle | search -->


            <!-- parent | group | active -->
            <div v-if="activeSchool || (entity.active.id && entity.name !== 'schools')"
                 class="pt-3 lg:w-8 capitalize flex align-items-center justify-content-start gap-2">

              <div v-if="activeSchool" class="flex justify-content-between gap-3 fadein animation-duration-500">
                <Button :label="activeSchool.name"
                        class="lg:w-12rem text-xs capitalize" outlined rounded
                        severity="warn"/>
              </div>

              <div v-if="entity.active.id && entity.name !== 'schools'" class="lg:p-0 fadein animation-duration-500">
                <Button
                    :label="entity.name==='classes' ? getClassName(entity.active.name) : (entity.active.label || entity.active.name || entity.active.username)"
                    class="w-full lg:w-9rem white-space-nowrap text-xs capitalize align-items-end"
                    icon="pi pi-times text-xs"
                    icon-pos="right" outlined rounded
                    severity="warn"
                    @click="closeEdit()"/>
              </div>

            </div>
            <!-- /parent | group | active -->

          </div>
        </template>

        <!-- Data Columns -->
        <Column v-for="prop in entity.props.filter($prop => !$prop.no_tbl)"
                :field="prop.field"
                :header="prop.label || prop.name"
                class="white-space-nowrap capitalize"
                header-class="h-3rem bg-gray-100 capitalize font-light text-xs text-gray-700">

          <template #body="{data}">

            <div class="fadein animation-duration-1000">

              <!-- single relation -->
              <template v-if="prop.single_relation && data[prop.field]">
                <template v-if="entity.name==='pupils'">
                  {{ getClassName(data[prop.field]) }}
                </template>
                <template v-else>
                  {{ getEntityItemName(prop.single_relation, data[prop.field]) }}
                </template>
              </template>
              <!-- /single relation -->


              <!-- parent relation -->
              <template v-else-if="prop.parent_relation && data[prop.field]">
                {{ getEntityItemName(prop.parent_relation, data[prop.field]) }}
              </template>
              <!-- /parent relation -->


              <!-- list count -->
              <template v-else-if="prop.list">
                {{ data[prop.field] ? data[prop.field].length : 0 }}
              </template>
              <!-- /list count -->


              <!-- true / false -->
              <template v-else-if="prop.checkbox">
                {{ data[prop.field] ? 'yes' : '-' }}
              </template>


              <!-- text data -->
              <template v-else>
                {{ data[prop.field] }}
              </template>
              <!-- /text data -->
            </div>

          </template>

        </Column>
        <!-- /Data Columns -->

        <!-- Manage Column -->
        <Column header-class="bg-gray-100 capitalize font-light text-xs text-gray-700">
          <template #body="{data}">

            <div class="lg:pr-2 flex gap-3 justify-content-end">

              <!-- close editMode -->
              <Button v-if="data===entity.active"
                      :outlined="data!==entity.active"
                      class="hover:shadow-2"
                      icon="pi pi-times text-xs" rounded
                      severity="secondary"
                      size="small"
                      @click="closeEdit"/>

              <!-- editMode -->
              <Button v-else :outlined="data!==entity.active"
                      class="hover:shadow-2"
                      icon="pi pi-pen-to-square" rounded
                      severity="secondary"
                      size="small"
                      @click="entity.active = data; editMode=1"/>

              <!-- delete -->
              <Button :outlined="data!==entity.active"
                      class="hover:shadow-2"
                      icon="pi pi-trash" rounded
                      severity="danger"
                      size="small"
                      @click="entity.active=data; showDialog=true"/>

            </div>
          </template>
        </Column>
        <!-- /Manage Column -->

        <!-- Pagination -->
        <template #paginatorend>

          <div v-if="['classes', 'pupils', 'teachers'].includes(entity.name)"
               class="w-full flex align-items-center gap-2 fadein animation-duration-500">

            <div class="lg:w-14rem pr-2">
              <Select v-model="getEntityByName('schools').active"
                      :options="getEntityByName('schools').data"
                      class="capitalize" fluid
                      option-label="name"
                      placeholder="Active School"/>
            </div>

          </div>

        </template>
        <!-- /Pagination -->

      </DataTable>

    </div>
    <!-- /left col -->


    <!-- right col -->
    <div class="col-12 md:col-5 p-3 lg:pl-4 pt-0 capitalize">

      <!-- recent | new -->
      <div class="h-3rem lg:h-4rem bg-gray-50 border-1 border-gray-200 flex justify-content-between">

        <div class="flex align-items-center">
          <div class="pl-3" v-if="!entity.active.id && !editMode">
            <i class="pi pi-clock text-xs mr-1"/> Recent
          </div>

          <Button v-if="editMode"
                  class="h-full lg:w-6rem border-noround text-xs capitalize"
                  icon="pi pi-times text-xs"
                  label="Close"
                  severity="secondary"
                  @click="closeEdit()"/>
        </div>

        <div class="flex justify-content-end">
          <Button v-if="!editMode || entity.active.id"
                  class="h-full w-6rem border-noround"
                  icon="pi pi-plus"
                  label="New"
                  severity="success"
                  @click="newItemInit"/>
        </div>

      </div>
      <!-- /recent | new -->


      <!-- form -->
      <div v-if="editMode"
           class="h-fit pt-4 bg-white border-1 border-top-none border-gray-200 fadein animation-duration-1000">

        <!-- form grid -->
        <div class="grid m-0 px-2 lg:px-3">

          <div v-for="prop in getEntityFormFields()"
               :class="`${prop.class || 'col-12 lg:col-6' }`">

            <label :for="prop.field" class="block text-xs">
              {{ prop.label || prop.name }}
            </label>

            <!-- parent entity single relation selection -->
            <Select v-if="prop.parent_relation"
                    :id="prop.field"
                    v-model="entity.active[prop.field]"
                    :options="getEntityByName(prop.parent_relation).data" filter
                    fluid option-label="name" option-value="id"/>

            <!-- relative entity single relation selection -->
            <Select v-else-if="prop.single_relation"
                    :id="prop.field"
                    v-model="entity.active[prop.field]"
                    :options="entity.name==='pupils'? getOptions(prop) : getEntityByName(prop.single_relation).data"
                    class="capitalize"
                    filter fluid
                    option-label="name"
                    option-value="id"/>

            <!-- entity prop options list -->
            <Select v-else-if="prop.options"
                    :id="prop.field"
                    v-model="entity.active[prop.name]"
                    :options="prop.options" fluid/>

            <!-- multiple relation selection -->
            <MultiSelect v-else-if="prop.list && prop.multiple"
                         :id="prop.field"
                         v-model="entity.active[prop.name]"
                         :options="getOptions(prop)"
                         filter fluid
                         option-label="name"
                         option-value="id"/>

            <!-- items list -->
            <Select v-else-if="prop.select"
                    :id="prop.field"
                    v-model="getEntityByName(prop.select).active"
                    :options="getEntityByName(prop.select).data" filter
                    fluid option-label="name"/>

            <!-- binary -->
            <Checkbox v-else-if="prop.checkbox"
                      :id="prop.field"
                      v-model="entity.active[prop.field]"
                      autocomplete="off"
                      binary fluid size="large"/>

            <!-- number | password | text -->
            <InputText v-else
                       :id="prop.field"
                       v-model="entity.active[prop.field]"
                       :type="prop.type || 'text'"
                       autocomplete="off"
                       fluid/>
          </div>

        </div>
        <!-- /form grid -->


        <!-- submit -->
        <div class="py-3 px-4 flex align-items-center justify-content-end">
          <Button
              :disabled="is_loading || (!entity.active.name && (!entity.active.username && !entity.active.new_password))"
              :icon="entity.active.id ? 'pi pi-check-circle' : 'pi pi-plus'"
              :label="entity.active.id ? 'update' : 'add'"
              :loading="is_loading"
              class="w-full lg:w-7rem border-round-2xl text-sm capitalize hover:shadow-2"
              severity="primary"
              @click="submitForm"/>
        </div>
        <!-- submit -->


        <!-- created | modified -->
        <div v-if="entity.active.id"
             class="px-4 h-3rem bg-gray-100 flex justify-content-between align-items-center text-xs fadein animation-duration-500">
          <div>
            {{ 'created: ' + new Date(entity.active.id).toDateString() }}
            {{ ' | ' + new Date(entity.active.id).toLocaleTimeString() }}
          </div>
          <div class="tex-right">
            {{ 'modified: ' + new Date(entity.active.modified).toDateString() }}
            {{ ' | ' + new Date(entity.active.modified).toLocaleTimeString() }}
          </div>
        </div>
        <!-- created | modified -->

      </div>
      <!-- /form -->


      <!-- Recent items -->
      <div v-else class="fadein animation-duration-1000">
        <DataTable
            :row-class="rowClass"
            :show-headers="false"
            :value="recentItems"
            class="border-1 border-top-none border-gray-300 text-sm"
            data-key="id" row-hover
            size="large" striped-rows>

          <Column field="name">
            <template #body="{data}">

              <!-- recent item name | username -->
              <div class="font-bold">
                <template v-if="entity.name === 'classes'">
                  {{ getClassName(data.name) }}
                </template>

                <template v-else>
                  {{ data.name || data.username }}
                </template>
              </div>
              <!-- /recent item name | username -->

              <!-- recent item date -->
              <small class="text-xs">
                <span>{{ new Date(data.id).toDateString() }}</span>
                <span class="lowercase">{{ new Date(data.id).toLocaleTimeString() }}</span>
              </small>
              <!-- /recent item date -->

            </template>
          </Column>

        </DataTable>
      </div>
      <!-- /Recent items -->


    </div>
    <!-- /right col -->

  </div>
  <!-- /content grid -->


  <!-- dialog -->
  <Dialog v-model:visible="showDialog"
          class="w-18rem md:w-22rem lg:w-30rem"
          header="Confirm Delete" modal>

    <!-- item name -->
    <div class="pt-2 flex align-items-center font-bold capitalize">
      <template v-if="entity.name === 'classes'">
        {{ getClassName(entity.active.name) }}
      </template>

      <template v-else>
        {{ (entity.active.name || entity.active.username) }}
      </template>
    </div>
    <!-- /item name -->

    <!-- item details -->
    <div class="pb-2 flex align-items-center text-sm">
      {{ entity.active.details }}
    </div>
    <!-- item details -->

    <!-- admin password -->
    <div v-if="entity.name==='admins'" class="py-3">
      <label class="text-xs font-light text-gray-600 font-light"
             for="del-password-ip">
        Password
      </label>
      <div>
        <InputText id="del-password-ip" v-model="entity.active.password" type="password" fluid/>
      </div>
    </div>
    <!-- /admin password -->

    <!-- submit -->
    <div class="pt-4 flex justify-content-between">
      <Button class="shadow-1"
              icon="pi pi-times" label="Cancel" rounded
              severity="secondary"
              type="button"
              @click="showDialog = false"/>

      <Button icon="pi pi-trash"
              label="Delete"
              severity="danger"
              @click="deleteItem(); showDialog = false"/>
    </div>
    <!-- /submit -->

  </Dialog>

</template>


<script lang="js">
import {FilterMatchMode} from '@primevue/core/api';

export default defineComponent({
  name: "Registration",

  data() {
    return {
      //server url.
      //server_url: "http://localhost:3001/api/",//dev

      //UI.
      mode      : "management",
      showDialog: false,
      editMode  : null,
      is_loading: false,

      regions: [],

      //entity.
      entity  : {
        active: {
          id: null
        },
        props : [],
        data  : []
      },
      entities: [

        //classes.
        {
          active: {
            id     : null,
            metrics: {}
          },
          parent: "schools",
          icon  : "pi pi-users",
          name  : "classes",
          label : "classes",
          props : [

            //class name.
            {
              field          : "name",
              name           : 'name',
              single_relation: "class_types",
              label          : "class"
            },

            //group name.
            {
              field: "group",
              name : "group",
              label: "group"
            },

            //parent school.
            {
              field          : "school",
              name           : 'school',
              parent_relation: "schools",
              "class"        : "col-12",
            },

            //boys.
            {
              field: "boys",
              name : 'boys',
              label: 'boys',
              type : "number"
            },

            //girls.
            {
              field: "girls",
              name : 'girls',
              label: 'girls',
              type : "number"
            },

            //total.
            {
              field  : "total",
              name   : 'total',
              label  : 'total',
              type   : "number",
              no_edit: 1
            },

            //class details.
            {
              field  : 'details',
              name   : 'details',
              "class": "col-12",
              no_tbl : 1
            },
          ],

          //class metrics.
          metrics: {
            //session metrics.
            sessions       : 100,
            session_minutes: 450,
            session_rating : 3,

            //activity metrics.
            new_users   : 5,
            daily_users : 20,
            weekly_users: 40,

            //learning metrics.
            completion_rate     : 70,
            subjects_per_session: 3,
            avg_rating          : 4.5,
          },
          //class metrics.

          //class items.
          data: []
        },

        //teachers.
        {
          active: {
            id: null
          },
          parent: "school",
          icon  : "pi pi-user",
          name  : "teachers",
          label : "teachers",
          props : [
            //school.
            {
              field          : "school",
              name           : "school",
              parent_relation: "schools",
              "class"        : "col-12",
              no_tbl         : 1
            },

            //teacher ID.
            {
              field: 'teacher_id',
              name : 'teacher ID',
              label: 'teacher ID'
            },

            //teacher name.
            {
              field: 'name',
              name : "name",
              label: "name"
            },

            //teacher subjects.
            {
              field   : "subjects",
              name    : 'subjects',
              list    : "subjects",
              "class" : "col-12",
              label   : "subjects",
              multiple: true
            },

            //teacher classes.
            {
              field   : "classes",
              name    : 'classes',
              list    : "classes",
              label   : "classes",
              "class" : "col-12",
              multiple: true
            },

            //teacher details.
            {
              field  : 'details',
              name   : 'details',
              "class": "col-12",
              no_tbl : 1
            },
          ],
          data  : []
        },

        //pupils.
        {
          active: {
            id: null
          },
          parent: "school",
          icon  : "pi pi-users",
          name  : "pupils",
          label : "pupils",
          props : [
            //school.
            {
              field          : "school",
              name           : "school",
              parent_relation: "schools",
              "class"        : "col-12",
              no_tbl         : 1
            },

            //class/group.
            {
              field          : "class",
              name           : "class",
              single_relation: "classes",
              label          : "class",
              "class"        : "col-12"
            },

            //pupil name.
            {
              field: "name",
              name : "name",
              label: "name"
            },

            //age.
            {
              field: "age",
              name : "age",
              label: "age",
              type : "number"
            },

            //gender.
            {
              field  : "gender",
              name   : "gender",
              label  : "gender",
              options: ["male", "female"]
            },

            //pupil details.
            {
              field  : "details",
              name   : "details",
              "class": "col-12",
              no_tbl : 1
            },
          ],
          data  : []
        },

        //config types.
        //class types.
        {
          //active class_type.
          active: {
            id: null
          },

          icon  : "pi pi-users",
          name  : "class_types",
          label : "class types",
          props : [
            {
              field  : "name",
              name   : 'name',
              label  : "class name",
              "class": "col-12"
            },
            {
              field  : 'details',
              name   : 'details',
              "class": "col-12",
              no_tbl : 1
            },
          ],
          config: 1,
          data  : [
            {
              id     : 1,
              name   : "grade 1",
              details: "7 year old",
              date   : new Date().getTime()
            },
            {
              id     : 2,
              name   : "grade 2",
              details: "8 year old",
              date   : new Date().getTime()
            },
            {
              id     : 3,
              name   : "grade 3",
              details: "9 year old",
              date   : new Date().getTime()
            },
          ]
        },


        //schools.
        {
          active: {
            id     : null,
            metrics: {}
          },
          icon  : "pi pi-building",
          name  : "schools",
          label : "schools",
          props : [
            //name.
            {
              field  : 'name',
              name   : 'name',
              label  : 'school name',
              "class": "col-12"
            },

            //class_types reference.
            {
              field          : "regions",
              name           : 'regions',
              single_relation: "regions",
              label          : "region"
            },

            //details.
            {
              field  : 'details',
              name   : 'details',
              "class": "col-12",
              no_tbl : 1
            },

            //boys.
            {
              field  : "boys",
              name   : 'boys',
              label  : 'boys',
              type   : "number",
              no_edit: 1
            },

            //girls.
            {
              field  : "girls",
              name   : 'girls',
              label  : 'girls',
              type   : "number",
              no_edit: 1
            },

            //total.
            {
              field  : "total",
              name   : 'total',
              label  : 'total',
              type   : "number",
              no_edit: 1
            },
          ],

          //school metrics.
          metrics: {
            //session metrics.
            sessions       : 500,
            session_minutes: 40,
            session_rating : 4,

            //activity metrics.
            new_users   : 30,
            daily_users : 30,
            weekly_users: 30,

            //learning metrics.
            completion_rate     : 45,
            subjects_per_session: 4,
            avg_rating          : 3.5,
          },
          //school metrics.

          //school items.
          data: []
        },

        //regions.
        {
          active : {
            id: null
          },
          icon   : "pi pi-map-marker",
          name   : "regions",
          label  : "regions",
          props  : [
            {
              field: "name",
              name : 'name',
              label: "region name"
            },
            {
              field  : 'details',
              name   : 'details',
              "class": "col-12",
              no_tbl : 1
            },
          ],
          metrics: {
            //session metrics.
            sessions       : 20,
            session_minutes: 45,
            session_rating : 4,

            //activity metrics.
            new_users   : 2,
            daily_users : 10,
            weekly_users: 20,

            //learning metrics.
            completion_rate     : 68,
            subjects_per_session: 4,
            avg_rating          : 3.5,
          },
          config : 1,
          data   : []
        },

        //admins.
        {
          active : {
            id: null
          },
          icon   : "pi pi-users",
          name   : "admins",
          label  : "admin",
          config : 1,
          props  : [
            {
              field: "username",
              name : 'username',
              label: "username"
            },
            {
              field    : "new_username",
              name     : 'new_username',
              label    : "new username",
              no_create: 1
            },
            {
              field : "password",
              name  : 'password',
              label : "password",
              no_tbl: 1
            },
            {
              field    : "new_password",
              name     : 'new_password',
              label    : "new password",
              no_create: 1,
              no_tbl   : 1
            },
            {
              field  : 'details',
              name   : 'details',
              "class": "col-12",
            },
          ],
          metrics: {
            //session metrics.
            sessions       : 20,
            session_minutes: 45,
            session_rating : 4,

            //activity metrics.
            new_users   : 2,
            daily_users : 10,
            weekly_users: 20,

            //learning metrics.
            completion_rate     : 68,
            subjects_per_session: 4,
            avg_rating          : 3.5,
          },
          data   : []
        },
      ],

      //table.
      filters: {
        global: {
          value    : null,
          matchMode: FilterMatchMode.CONTAINS
        },
      },

      //cache.
      cache: {}
    }
  },

  computed: {

    server_url() {
      return useState('server_url').value;
    },

    //recent items.
    recentItems() {

      const now       = new Date().getTime();
      const five_days = (1000 * 60 * 60 * 24 * 5);
      return this.entity.data.filter(item => (now - item.modified) < five_days).splice(0, 4)

    },

    //table items--.
    tableData() {
      //schools | config.
      if (this.entity.config || this.entity.name === 'schools') return this.entity.data;


      //active entity item school.
      let school_id = this.entity.active.school || this.getEntityByName('schools').active.id;
      if (school_id) {
        return this.entity.data
                   .filter(item => Number(item.school) === Number(school_id));
      }

      //return.
      return this.entity.data;
    },

    //active school.
    activeSchool() {
      let school_id = this.entity.active.school || this.getEntityByName('schools').active.id;
      if (school_id) return this.getItemByID('schools', school_id)
    }
  },

  methods: {

    //get class name
    getClassName(class_type_id) {
      const class_item = this.getItemByID('classes', class_type_id);
      if (class_item) {
        const class_type = this.getItemByID('class_types', class_item.name);
        const base_name  = class_type ? class_type.name : class_item.name;
        return class_item.group ? `${base_name} - ${class_item.group}` : base_name;
      }

      const class_type = this.getItemByID('class_types', class_type_id);
      if (class_type) return class_type.name;
    },

    //get entity form display fields.
    getEntityFormFields() {
      //get entity props.
      const form_fields = this.entity.props.filter(prop => !prop.no_edit);

      //create mode.
      if (!this.entity.active.id) return form_fields.filter(prop => !prop.no_create);

      //update mode.
      return form_fields;
    },

    //get prop options.
    getOptions(prop) {
      //teacher | pupil class list.
      if (['pupils', 'teachers'].includes(this.entity.name) && ['class', 'classes'].includes(prop.name)) {

        //school ID check.
        if (!this.entity.active.school) return [];

        //get school classes.
        const school_id = this.entity.active.school;
        const classes   = this.getEntityByName('classes').data
                              .filter(class_ => class_.school === school_id);
        if (!classes.length) return [];

        //populate class options.
        return classes.map(class_ => {
          //get class type.
          const class_type = this.getItemByID('class_types', class_.name);

          //class type exists.
          if (class_type) return {
            name: class_.group ? `${class_type.name} - ${class_.group}` : class_type.name,
            id  : class_.id
          }
        });

      } //teacher | pupil class list.

      //!teacher | pupil entity.
      else return this.getEntityByName(prop.list).data
    },


    //switch modes.
    switchMode() {
      if (this.mode === 'management') {
        this.mode   = 'config';
        this.entity = this.getEntityByName('regions');
      }
      else {
        this.mode   = 'management';
        this.entity = this.getEntityByName('schools');
      }
    },

    //set new active entity.
    switchEntity(entity) {
      if (!entity.active.id) this.editMode = null;
      this.entity = entity;
    },


    //Close edit mode.
    closeEdit() {
      this.entity.active = {
        id     : null,
        metrics: {}
      };
      this.editMode      = null;
    },

    //new item init.
    newItemInit() {
      this.editMode      = 1;
      this.entity.active = {
        id     : null,
        metrics: {}
      };
    },

    //submitForm
    submitForm() {
      if (this.entity.active.id) this.updateItem();
      else this.createItem();
    },

    //createItem
    async createItem() {
      //validate required props.
      if (!this.entity.active.name && (!this.entity.active.username || !this.entity.active.password)) return;
      if (this.entity.name === 'classes' && !this.entity.active.group) {
        this.notify('Insert Error', 'Group is required for classes', 'warn');
        return;
      }

      //insert item.
      try {
        this.is_loading = true;
        const res       = await $fetch(this.server_url + this.entity.name, {
          method: "POST",
          body  : JSON.stringify(this.entity.active)
        });
        this.is_loading = false;

        //insert successful.
        if (res.success && res.data) {
          //notify.
          this.notify('Insert Successful', res.success, 'success');

          //set active | update local.
          this.entity.active = res.data;
          this.entity.data.push(res.data);
        }

        //server insert error.
        else if (res.error) {
          this.notify('Insert Error', res.error, 'warn');
        }
      }
      catch (e) {
        //stop loading | notify.
        this.is_loading = false;
        this.notify('Insert Error', 'Unable to insert item', 'warn');
      }
    },

    //updateItem
    async updateItem() {

      //classes entity.
      if (this.entity.name === 'classes') {
        if (this.entity.active.boys) this.entity.active.total = Number(this.entity.active.boys) + Number(this.entity.active.girls || 0);
        if (this.entity.active.girls) this.entity.active.total = Number(this.entity.active.girls) + Number(this.entity.active.boys || 0);
        this.updateSchools();
      }

      //send data.
      try {
        this.is_loading = true;
        const res       = await $fetch(this.server_url + this.entity.name, {
          method: "PUT",
          body  : JSON.stringify(this.entity.active)
        });
        this.is_loading = false;

        //insert successful.
        if (res.success && res.data) {
          //notify.
          this.notify('Update Successful', res.success, 'success');

          //update local.
          const ix = this.entity.data.findIndex(item => item.id === this.entity.active.id);
          if (ix !== undefined) this.entity.data[ix] = res.data;
          this.entity.active = res.data;
        }

        //server insert error.
        else if (res.error) {
          this.notify('Update Error', res.error, 'warn');
        }

      }
      catch (e) {
        //stop loading | notify.
        this.is_loading = false;
        this.notify('Update Error', 'Unable to update item', 'warn');
      }
    },

    //deleteItem
    async deleteItem() {
      try {
        this.is_loading = true;
        const res       = await $fetch(this.server_url + this.entity.name, {
          method: "DELETE",
          body  : JSON.stringify(this.entity.active)
        });
        this.is_loading = false;

        //Delete successful.
        if (res.success) {
          //remove local.
          const ix = this.entity.data.findIndex(item => item.id === this.entity.active.id);
          if (ix !== undefined) this.entity.data.splice(ix, 1);

          //notify.
          this.notify('Delete Successful', res.success, 'success');

          //remove active.
          this.entity.active = {id: null};
        }

        //server delete error.
        else if (res.error) {
          this.notify('Delete Error', res.error, 'warn');
        }
      }
      catch (e) {
        //stop loading | notify.
        this.is_loading = false;
        this.notify('Delete Error', 'Unable to delete item', 'warn');
      }
    },

    //update school count.
    updateSchools() {
      this.getEntityByName('schools').data.forEach(school => {
        school.girls = 0;
        school.boys  = 0;

        const school_classes = this.getEntityByName('classes').data
                                   .filter(class_ => Number(class_.school) === Number(school.id));

        school_classes.forEach(class_ => {
          if (class_.boys) school.boys += Number(class_.boys);
          if (class_.girls) school.girls += Number(class_.girls);
        });

        //calculate total.
        school.total = school.boys + school.girls;
      });
    },


    //get entity item.
    getItemByID(entity_name, item_id) {
      //params check.
      if (!entity_name && item_id) return {name: null};

      //get entity.
      const entity = this.getEntityByName(entity_name);

      //return.
      if (entity && entity.data) return entity.data.find(item => Number(item.id) === Number(item_id))
      else return {name: null};
    },

    //get item name.
    getEntityItemName(entity_name, item_id) {
      //params check.
      if (!(entity_name && item_id)) return null;

      //get entity.
      const entity = this.getEntityByName(entity_name);
      if (entity && entity.data) {
        const item = entity.data
                           .find(item_ => Number(item_.id) === Number(item_id));

        //return.
        return (item ? item.name : '-');
      }
    },

    //getEntity by name.
    getEntityByName(name) {
      if (!this.cache[name]) {
        this.cache[name] = this.entities.find(entity => entity.name === name);
      }
      return this.cache[name];
    },


    //rowClass()
    rowClass(data) {
      return data === this.entity.active ? 'bg-orange-600 text-white' : ''
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
    async loadItems(entity_name) {

      try {
        this.is_loading = true;
        const items     = await $fetch(this.server_url + (entity_name || this.entity.name));
        this.is_loading = false;


        //update current entity items.
        if (!entity_name) {
          //update current entity.
          this.entity.data   = items;
          this.entity.active = {id: null};

          //update UI.
          this.closeEdit();

          //clear cache.
          this.cache[entity_name] = null;

          //classes entity.
          if (entity_name === 'classes') this.updateSchools();
        }
        else return items;
      }

          //client load error.
      catch (e) {
        //stop load | notify.
        this.is_loading = false;
        this.notify('Load Error', 'Unable to load items', 'warn');
      }
    },


  },

  //mounted.
  async mounted() {
    //fetch primary entity.
    this.entity = this.getEntityByName('schools');
    await this.loadItems();

    //background fetch.
    for (const entity_name of ['class_types', 'regions', 'admins', 'classes', 'teachers', 'pupils']) {
      this.getEntityByName(entity_name).data = await this.loadItems(entity_name);

      //classes entity.
      if (entity_name === 'classes') this.updateSchools();
    }
  }

})
</script>


<style>
.p-datatable-header {
  padding: 0 !important;
}
</style>
