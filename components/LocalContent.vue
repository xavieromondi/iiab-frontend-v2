<template>
  <div class="col-12 px-3">

    <!-- header -->
    <div class="w-full p-3 border-1 border-gray-300 flex align-items-center justify-content-between gap-3">

      <!-- new video upload -->
      <div class="flex align-items-center gap-3">

        <!-- controls -->
        <Button v-if="provider==='usb'" label="Videos" icon="pi pi-youtube" rounded severity="success" outlined
                @click="provider='videos';"/>
        <Button v-if="provider==='videos'" label="USB" icon="pi pi-share-alt" rounded severity="success" outlined
                @click="provider='usb'"/>


        <!-- new video upload -->
        <template v-if="mode==='new-file' && !video && provider==='videos'">
          <div>
            <FileUpload ref="fileupload"
                        :maxFileSize="20000000"
                        :url="server_url + 'files'"
                        :name="String(user_id)"
                        accept="video/*"
                        choose-label="Select video"
                        class="h-2rem shadow-2 fadein animation-duration-1000"
                        mode="basic"
                        @upload="onUpload"
                        @error="uploadError"
                        @select="setFile"/>
            <div class="text-gray-600 text-xs">20MB maximum</div>
          </div>

          <div class="text-center">
            <Button :disabled="!new_video"
                    :loading="is_loading==='uploading-file'"
                    class="h-2rem fadein animation-duration-1000"
                    icon="pi pi-upload"
                    label="Upload video"
                    raised
                    rounded
                    severity="secondary"
                    @click="uploadFile"/>
            <div class="text-gray-600 text-xs">Click to upload</div>
          </div>
        </template>
        <!-- /new video upload -->

        <!-- active video -->
        <div v-else-if="video" class="flex align-items-center gap-3">
          <!-- video name -->
          <span>{{ video.name }}</span>

          <!-- close video -->
          <Button class="shadow-2"
                  icon="pi pi-times" outlined rounded
                  severity="secondary"
                  size="small"
                  @click="closeVideo"/>

          <!-- delete video -->
          <Button class="shadow-2"
                  icon="pi pi-trash" outlined rounded
                  severity="danger"
                  @click="$refs.delete_popover.toggle($event);"
                  size="small"/>

          <!-- date popup -->
          <Popover ref="delete_popover">
            <div class="w-16rem">
              <div class="text-center py-2">
                Delete video ?
              </div>
              <Button raised
                      label="delete"
                      class="block w-full"
                      severity="danger"
                      @click="deleteFile">
                <i class="pi pi-trash mr-1"/>
                <span>Delete</span>
              </Button>
            </div>
          </Popover>
          <!-- /date popup -->
        </div>
        <!-- /active video -->
      </div>
      <!-- /video upload -->


      <!-- reload | new video controls -->
      <div class="flex gap-3">
        <!-- reload -->
        <Button icon="pi pi-refresh" outlined raised
                rounded size="small"
                @click="provider==='videos' ? getFiles() : getUSBData()"/>

        <!-- new video -->
        <Button v-if="provider==='videos'"
                :outlined="mode!=='new-file'"
                icon="pi pi-plus"
                label="New video" raised rounded
                severity="success"
                size="small"
                @click="newVideoInit"/>
      </div>
      <!-- /reload | new video controls -->

    </div>
    <!-- header -->


    <!-- content -->
    <div class="grid m-0 shadow-1 border-1 border-top-none border-gray-300 text-gray-700"
         style="height: 75vh">

      <div v-if="provider==='usb'" class="col-12 p-4">

        <DataTable v-if="usb_files.length" :loading="is_loading"
                   :value="usb_files"
                   row-hover
                   :show-headers="false"
                   :rows="5"
                   size="large"
                   striped-rows
                   class="w-full border-1 border-gray-200">
          <Column field="name"></Column>
          <Column field="link" header="Link"></Column>
        </DataTable>

        <!-- no files -->
        <div v-else class="col-12 pt-8 text-center fadein animation-duration">
          <div>
            <i class="pi pi-exclamation-circle text-orange-600 text-3xl"/>
          </div>
          <div>No Files Available</div>
        </div>
        <!-- /no files -->

      </div>


      <!-- video player -->
      <div v-else-if="video" class="col-12 fadein animation-duration">
        <video class="w-full shadow-3 fadein animation-duration-1000"
               :src="server_url+'files?file='+video.name" autoplay loop controls
               style="height: 80vh">
          Your browser does not support the video tag.
        </video>
      </div>
      <!-- /video player -->


      <!-- files -->
      <div v-else-if="!videos.length" class="col-12 pt-8 text-center fadein animation-duration">
        <div>
          <i class="pi pi-exclamation-circle text-orange-600 text-3xl"/>
        </div>
        <div>No Videos Available</div>
      </div>
      <!-- files -->

      <!-- files -->
      <template v-else>
        <div v-for="(file_, ix) in videos" class="col-4 md:col-3 p-3">
          <div
              class="h-8rem bg-green-500 flex align-items-center shadow-2 border-2 border-white hover:shadow-3 border-round-xl"
              @click="video=file_; video_ix=ix">

            <div class="w-full text-center text-white">
              <i class="pi pi-caret-right text-2xl"/>
              <div class="px-3 capitalize text-center">
                {{ file_.name.replace(user_id + '_', '').replace(/_/g, ' ').toLowerCase() }}
              </div>
            </div>

          </div>
        </div>
      </template>
      <!-- /files -->

    </div>
    <!-- /content -->

  </div>
</template>


<script lang="js">
export default defineComponent({

  name: "LocalContent",

  data() {
    return {
      //provider
      provider : 'usb',
      usb_files: [],

      //file vars.
      videos   : [],
      video    : null,
      new_video: null,
      video_ix : null,

      //UI state.
      is_loading: true,
      mode      : null
    }
  },

  computed: {
    server_url() {
      return useState('server_url').value;
    },
    usb_url() {
      return useState('usb_url').value;
    },
    user_id() {
      return useState('session').value.class_.id;
    }
  },

  methods: {
/////////////////////////////////// FILE CONTROLS.
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

    //load files.
    async getFiles() {
      //reset UI.
      this.video = null;
      this.mode  = null;

      //fetch files.
      try {
        this.is_loading = true;
        const res       = await $fetch(this.server_url + 'files', {
          query: {
            id: this.user_id
          }
        });
        this.is_loading = false;

        if (res.error) {
          this.notify('file load error', res.error, 'warn');
          return;
        }

        //save files.
        this.videos = res.files;
        if (!this.videos.length) this.notify('No Files', 'sorry, no files available', 'warn');
      }
      catch (e) {
        //client error.
        this.is_loading = false;
        this.notify('file load error', 'sorry, unable to reach server.', 'warn');
      }
    },

    //upload file.
    async uploadFile() {
      //no file selected.
      if (!this.new_video) {
        this.notify('file error', 'please select a file', 'warn');
        return;
      }

      //upload file.
      this.is_loading = 'uploading-file';
      this.$refs.fileupload.upload();
    },

    //upload feedback.
    onUpload(data) {
      //reload files.
      this.getFiles();

      //notify.
      this.notify('file uploaded', 'File upload successful', 'success');
    },

    //upload error feedback.
    uploadError() {
      this.notify('file upload error', 'File upload unsuccessful', 'warn');
    },

    //delete file.
    async deleteFile() {

      try {
        this.is_loading = true;
        const res       = await $fetch(this.server_url + 'files?id=' + this.video.name, {
          method: "DELETE"
        });
        this.is_loading = false;

        //Delete successful.
        if (res.success) {
          //remove local.
          if (this.video_ix !== undefined) this.videos.splice(this.video_ix, 1);

          //reset.
          this.video    = null;
          this.video_ix = null;

          //notify.
          this.notify('Delete Successful', res.success, 'success');
        }

        //server delete error.
        else if (res.error) {
          this.notify('Delete Error', res.error, 'warn');
        }
      }
      catch (e) {
        //stop loading | notify.
        this.is_loading = false;
        this.notify('Delete Error', 'Unable to delete video', 'warn');
      }


    },

    //close video.
    closeVideo() {
      this.video = null;
      this.mode  = null;
    },

    //new video initialization.
    newVideoInit() {
      this.mode  = (this.mode ? null : 'new-file');
      this.video = null;
    },

    //set active file.
    setFile() {
      if (!this.$refs.fileupload.files[0]) return;
      this.new_video = this.$refs.fileupload.files[0];
    },
/////////////////////////////////// FILE CONTROLS.


/////////////////////////////////// USB CONTROLS.
    async getUSBData() {

      try {
        //get raw html.
        this.is_loading = true;
        const html      = await $fetch(this.usb_url);
        this.is_loading = false;

        //parse content.
        const parser = new DOMParser();
        const doc    = parser.parseFromString(html, 'text/html');

        //populate file data.
        const rows     = Array.from(doc.querySelectorAll('#list tbody tr'));
        this.usb_files = [];

        //populate files.
        rows.filter((row, ix) => ix > 0)
            .forEach(row => {

              const tds = row.querySelectorAll('td');
              if (tds.length >= 3) {
                const nameCell = tds[0];
                const link     = nameCell.querySelector('a')?.getAttribute('href') || '';

                this.usb_files.push({
                  name: nameCell.innerText.trim(),
                  link: link,
                  size: tds[1].innerText.trim(),
                  date: tds[2].innerText.trim(),
                });
              }

            });
      }
      catch (e) {
        this.notify('Server Error.', 'Sorry, unable to fetch files.', 'warn');
        this.is_loading = false;
      }

    },
/////////////////////////////////// USB CONTROLS.


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


  },

  mounted() {
    //fetch files.
    this.videos = this.getUSBData();
    this.updateUrl({provider: 'local', grade: null, subject: null, link: null});
  }
})
</script>
