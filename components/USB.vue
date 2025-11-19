<template>
  <div class="col-12 px-3">

    <!-- header -->
    <div class="w-full p-3 border-1 border-gray-300 flex align-items-center justify-content-between gap-3">

      <!-- new video upload -->
      <div class="flex align-items-center gap-2">

        <!-- new video upload -->
        <template v-if="mode==='new-file' && !file">
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
            <Button :disabled="!new_file"
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
        <div v-else-if="file" class="flex align-items-center gap-3">
          <!-- video name -->
          <span>{{ file.name }}</span>

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
                @click="getFiles()"/>

        <!-- new video -->
        <Button :outlined="mode!=='new-file'"
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

      <!-- video player -->
      <div v-if="file" class="col-12 fadein animation-duration">
        <video class="w-full shadow-3 fadein animation-duration-1000"
               :src="server_url+'files?file='+file.name" autoplay loop controls
               style="height: 80vh">
          Your browser does not support the video tag.
        </video>
      </div>
      <!-- /video player -->


      <!-- files -->
      <div v-else-if="!files.length" class="col-12 pt-8 text-center fadein animation-duration">
        <div>
          <i class="pi pi-exclamation-circle text-orange-600 text-3xl"/>
        </div>
        <div>No Videos Available</div>
      </div>
      <!-- files -->


      <!-- files -->
      <template v-else>
        <div v-for="(file_, ix) in files" class="col-4 md:col-3 p-3">
          <div
              class="h-8rem bg-green-500 flex align-items-center shadow-2 border-2 border-white hover:shadow-3 border-round-xl"
              @click="file=file_; file_ix=ix">

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

  name: "USB",

  data() {
    return {
      //file vars.
      files   : [],
      file    : null,
      new_file: null,
      file_ix : null,

      //UI state.
      is_loading: true,
      mode      : null
    }
  },

  computed: {
    server_url() {
      return useState('server_url').value;
    },
    user_id() {
      return useState('session').value.class_.id;
    }
  },

  methods: {
/////////////////////////////////// FILE CONTROLS.
    //load files.
    async getFiles() {
      //reset UI.
      this.file = null;
      this.mode = null;

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
        this.files = res.files;
        if(!this.files.length) this.notify('No Files', 'sorry, no files available', 'warn');
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
      if (!this.new_file) {
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
        const res       = await $fetch(this.server_url + 'files?id=' + this.file.name, {
          method: "DELETE"
        });
        this.is_loading = false;

        //Delete successful.
        if (res.success) {
          //remove local.
          if (this.file_ix !== undefined) this.files.splice(this.file_ix, 1);

          //reset.
          this.file    = null;
          this.file_ix = null;

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
      this.file = null;
      this.mode = null;
    },

    //new video initialization.
    newVideoInit() {
      this.mode = (this.mode ? null : 'new-file');
      this.file = null;
    },

    //set active file.
    setFile() {
      if (!this.$refs.fileupload.files[0]) return;
      this.new_file = this.$refs.fileupload.files[0];
    },
/////////////////////////////////// FILE CONTROLS.


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
    this.files = this.getFiles();
  }
})
</script>