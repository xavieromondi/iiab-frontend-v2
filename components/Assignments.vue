<template>
  <div class="col-12 p-4">
    <div class="flex gap-2 mb-3">
      <Button label="Student" :outlined="mode !== 'student'" rounded @click="mode = 'student'"/>
      <Button label="Teacher" :outlined="mode !== 'teacher'" rounded @click="mode = 'teacher'"/>
    </div>

    <!-- Student View -->
    <div v-if="mode === 'student'" class="grid">
      <div class="col-12 md:col-4">
        <div class="p-3 border-round-xl shadow-2">
          <div class="text-xs text-gray-600 mb-2">
            Enter the assignment code given by your teacher to access your task.
          </div>
          <div class="font-bold mb-2">Enter Assignment Code</div>
          <InputText v-model="student_code" placeholder="e.g. AB12CD" fluid class="mb-2"/>
          <Button label="Load" icon="pi pi-search" rounded @click="loadAssignmentByCode" :loading="loading"/>
        </div>
      </div>

      <div class="col-12 md:col-8" v-if="assignment">
        <div class="p-3 border-round-xl shadow-2">
          <div class="text-xl font-bold mb-2">{{ assignment.title }}</div>
          <div class="mb-2" v-if="assignment.instructions">{{ assignment.instructions }}</div>
          <div class="text-sm text-gray-500 mb-2" v-if="assignment.due_date">Due: {{ assignment.due_date }}</div>

          <div v-if="assignment.links && assignment.links.length" class="mb-3">
            <div class="font-bold mb-1">Links</div>
            <div v-for="l in assignment.links" :key="l" class="text-sm">
              <a :href="l" target="_blank" rel="noopener">{{ l }}</a>
            </div>
          </div>

          <div v-if="assignment.attachments && assignment.attachments.length" class="mb-3">
            <div class="font-bold mb-1">Files</div>
            <div v-for="f in assignment.attachments" :key="f.url" class="text-sm">
              <a :href="f.url" target="_blank" rel="noopener">{{ f.name }}</a>
            </div>
          </div>

          <div v-if="assignment.questions && assignment.questions.length" class="mb-3">
            <div class="font-bold mb-2">Questions</div>
            <div v-for="(q, i) in assignment.questions" :key="q.id" class="mb-3">
              <div class="font-bold">{{ i + 1 }}. {{ q.prompt }}</div>
              <div v-if="q.type === 'mcq'" class="mt-2">
                <div v-for="opt in q.options" :key="opt" class="mb-1">
                  <label class="flex align-items-center gap-2">
                    <input type="radio" :name="'q_' + q.id" :value="opt" v-model="answers[q.id]"/>
                    <span>{{ opt }}</span>
                  </label>
                </div>
              </div>
              <div v-else class="mt-2">
                <Textarea v-model="answers[q.id]" rows="3" fluid/>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <div class="font-bold mb-1">Extra Notes</div>
            <Textarea v-model="student_text" rows="3" fluid/>
          </div>

          <div class="mb-3">
            <div class="font-bold mb-1">Upload Files</div>
            <input type="file" multiple @change="onStudentFiles"/>
          </div>

          <Button label="Submit" icon="pi pi-check" rounded :loading="loading" @click="submitAssignment"/>
        </div>
      </div>
    </div>

    <!-- Teacher View -->
    <div v-else class="grid">
      <div class="col-12 md:col-4">
        <div class="p-3 border-round-xl shadow-2" v-if="!teacher_unlocked">
          <div class="text-xs text-gray-600 mb-2">
            Use the teacher code to unlock assignment creation and view submissions.
          </div>
          <div class="font-bold mb-2">Teacher Code</div>
          <InputText v-model="teacher_code" placeholder="Enter teacher code" fluid class="mb-2"/>
          <Button label="Unlock" icon="pi pi-unlock" rounded :loading="loading" @click="unlockTeacher"/>
        </div>

        <div class="p-3 border-round-xl shadow-2" v-else>
          <div class="text-xs text-gray-600 mb-2">
            Create an assignment, then share the generated student code.
          </div>
          <div class="font-bold mb-2">Create Assignment</div>
          <InputText v-model="form.title" placeholder="Title" fluid class="mb-2"/>
          <Textarea v-model="form.instructions" placeholder="Instructions" rows="3" fluid class="mb-2"/>
          <InputText v-model="form.due_date" placeholder="Due date (e.g. 2026-03-01)" fluid class="mb-2"/>
          <Textarea v-model="form.links_raw" placeholder="Links (one per line)" rows="3" fluid class="mb-2"/>

          <div class="mb-2">
            <div class="font-bold">Questions</div>
            <div v-for="(q, i) in form.questions" :key="q.id" class="border-1 border-round-md p-2 my-2">
              <div class="font-bold mb-1">Question {{ i + 1 }}</div>
              <InputText v-model="q.prompt" placeholder="Question" fluid class="mb-2"/>
              <Select v-model="q.type" :options="['mcq','short']" placeholder="Type" fluid class="mb-2"/>
              <div v-if="q.type === 'mcq'">
                <InputText v-model="q.options_raw" placeholder="Options (comma separated)" fluid class="mb-2"/>
                <InputText v-model="q.answer" placeholder="Correct option" fluid/>
              </div>
            </div>
            <Button label="Add Question" icon="pi pi-plus" rounded @click="addQuestion"/>
          </div>

          <div class="flex gap-2">
            <Button v-if="!edit_id" label="Create" icon="pi pi-save" rounded :loading="loading" @click="createAssignment"/>
            <Button v-else label="Update" icon="pi pi-save" rounded :loading="loading" @click="updateAssignment"/>
            <Button v-if="edit_id" label="Cancel" icon="pi pi-times" rounded outlined @click="cancelEdit"/>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-8" v-if="teacher_unlocked">
        <div class="p-3 border-round-xl shadow-2 mb-3">
          <div class="font-bold mb-2">Assignments</div>
          <div v-if="assignments.length === 0" class="text-sm">No assignments yet</div>
          <div v-for="a in assignments" :key="a.id" class="border-1 border-round-md p-2 my-2">
            <div class="flex justify-content-between align-items-center">
              <div>
                <div class="font-bold">{{ a.title }}</div>
                <div class="text-sm text-gray-500">Code: {{ a.code }}</div>
              </div>
              <div class="flex gap-2">
                <Button label="Submissions" size="small" @click="loadSubmissions(a)"/>
                <Button label="Edit" size="small" outlined @click="startEdit(a)"/>
                <Button label="Delete" size="small" severity="danger" outlined @click="deleteAssignment(a)"/>
              </div>
            </div>

            <div class="mt-2">
              <div class="font-bold text-sm">Upload Files</div>
              <input type="file" multiple @change="onAssignmentFiles($event, a)"/>
            </div>
          </div>
        </div>

        <div class="p-3 border-round-xl shadow-2" v-if="selected_assignment">
          <div class="font-bold mb-2">Submissions - {{ selected_assignment.title }}</div>
          <div v-if="analysis.length" class="mb-3">
            <div class="font-bold mb-2">Per-Question Results (by Grade/Group)</div>
            <div v-for="q in analysis" :key="q.id" class="border-1 border-round-md p-2 my-2">
              <div class="font-bold mb-1">{{ q.prompt }}</div>
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="text-sm font-bold text-green-700">Correct</div>
                  <div v-if="Object.keys(q.correct).length === 0" class="text-sm text-gray-500">None yet</div>
                  <div v-for="(count, label) in q.correct" :key="'c'+label" class="text-sm">
                    {{ label }}: {{ count }}
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="text-sm font-bold text-red-700">Wrong</div>
                  <div v-if="Object.keys(q.wrong).length === 0" class="text-sm text-gray-500">None yet</div>
                  <div v-for="(count, label) in q.wrong" :key="'w'+label" class="text-sm">
                    {{ label }}: {{ count }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="submissions.length === 0" class="text-sm">No submissions yet</div>
          <div v-for="s in submissions" :key="s.id" class="border-1 border-round-md p-2 my-2">
            <div class="font-bold">{{ s.school }} - {{ s.class_ }}</div>
            <div class="text-sm text-gray-500">Score: {{ s.score }} / {{ s.total }}</div>
            <div v-if="selected_assignment && (selected_assignment.questions || []).some(q => q.type !== 'mcq')" class="mt-2">
              <div class="font-bold text-sm mb-1">Short Answer Grading</div>
              <div v-for="q in (selected_assignment.questions || []).filter(q => q.type !== 'mcq')" :key="q.id" class="mb-2">
                <div class="text-sm font-bold">{{ q.prompt }}</div>
                <div class="text-sm text-gray-600 mb-1">
                  Answer: {{
                    (s.answers || []).find(a => a.question_id === q.id)?.answer || ''
                  }}
                </div>
                <div class="flex align-items-center gap-2">
                  <span class="text-xs text-gray-600">Mark (0/1)</span>
                  <InputText v-model="grading[s.id].scores[q.id]" style="max-width: 5rem" />
                </div>
              </div>
              <div class="mb-2">
                <div class="text-sm font-bold">Feedback</div>
                <Textarea v-model="grading[s.id].feedback" rows="2" fluid />
              </div>
              <Button label="Save Grade" size="small" @click="saveManualGrade(s)"/>
            </div>
            <div v-if="s.text" class="mt-1 text-sm">{{ s.text }}</div>
            <div v-if="s.files && s.files.length" class="mt-2 text-sm">
              <div class="font-bold">Files</div>
              <div v-for="f in s.files" :key="f.url">
                <a :href="f.url" target="_blank" rel="noopener">{{ f.name }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="js">
export default defineComponent({
  name: 'Assignments',

  data() {
    return {
      mode: 'student',
      loading: false,

      //teacher
      teacher_code: 'teacher123',
      teacher_unlocked: false,
      assignments: [],
      selected_assignment: null,
      submissions: [],
      analysis: [],
      grading: {},

      form: {
        title: '',
        instructions: '',
        due_date: '',
        links_raw: '',
        questions: []
      },
      edit_id: null,

      //student
      student_code: '',
      assignment: null,
      answers: {},
      student_text: '',
      student_files: []
    };
  },

  computed: {
    server_url() {
      return useState('server_url').value;
    },
    session() {
      return useState('session').value || {};
    }
  },

  methods: {
    async unlockTeacher() {
      if (!this.teacher_code) return;
      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments?validate=1&code=${encodeURIComponent(this.teacher_code)}`);
      this.loading = false;
      if (res && res.valid) {
        this.teacher_unlocked = true;
        this.loadAssignments();
      } else {
        this.$toast.add({severity: 'warn', summary: 'Invalid Code', detail: 'Teacher code is incorrect', life: 2000});
      }
    },

    async loadAssignments() {
      if (!this.teacher_unlocked) return;
      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments?teacher_code=${encodeURIComponent(this.teacher_code)}`);
      this.loading = false;
      this.assignments = Array.isArray(res) ? res : [];
    },

    addQuestion() {
      this.form.questions.push({
        id: `${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: 'mcq',
        prompt: '',
        options_raw: '',
        answer: ''
      });
    },

    startEdit(assignment) {
      this.edit_id = assignment.id;
      this.form = {
        title: assignment.title || '',
        instructions: assignment.instructions || '',
        due_date: assignment.due_date || '',
        links_raw: (assignment.links || []).join('\n'),
        questions: (assignment.questions || []).map(q => ({
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          options_raw: (q.options || []).join(', '),
          answer: q.answer || ''
        }))
      };
    },

    cancelEdit() {
      this.edit_id = null;
      this.form = {title: '', instructions: '', due_date: '', links_raw: '', questions: []};
    },

    async createAssignment() {
      if (!this.form.title) return;
      this.loading = true;
      const questions = this.form.questions.map(q => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        options: q.type === 'mcq' ? (q.options_raw || '').split(',').map(s => s.trim()).filter(Boolean) : [],
        answer: q.type === 'mcq' ? q.answer : ''
      }));

      const res = await $fetch(`${this.server_url}assignments`, {
        method: 'POST',
        body: {
          teacher_code: this.teacher_code,
          title: this.form.title,
          instructions: this.form.instructions,
          due_date: this.form.due_date,
          links: this.form.links_raw,
          questions
        }
      });
      this.loading = false;

      if (res && res.data) {
        this.assignments.unshift(res.data);
        this.form = {title: '', instructions: '', due_date: '', links_raw: '', questions: []};
        this.$toast.add({severity: 'success', summary: 'Created', detail: 'Assignment created', life: 2000});
      } else {
        this.$toast.add({severity: 'warn', summary: 'Error', detail: res.error || 'Unable to create', life: 2000});
      }
    },

    async updateAssignment() {
      if (!this.edit_id) return;
      this.loading = true;
      const questions = this.form.questions.map(q => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        options: q.type === 'mcq' ? (q.options_raw || '').split(',').map(s => s.trim()).filter(Boolean) : [],
        answer: q.type === 'mcq' ? q.answer : ''
      }));

      const res = await $fetch(`${this.server_url}assignments`, {
        method: 'PUT',
        body: {
          teacher_code: this.teacher_code,
          id: this.edit_id,
          title: this.form.title,
          instructions: this.form.instructions,
          due_date: this.form.due_date,
          links: this.form.links_raw,
          questions
        }
      });
      this.loading = false;

      if (res && res.data) {
        const idx = this.assignments.findIndex(a => a.id === this.edit_id);
        if (idx !== -1) this.assignments.splice(idx, 1, res.data);
        this.cancelEdit();
        this.$toast.add({severity: 'success', summary: 'Updated', detail: 'Assignment updated', life: 2000});
      } else {
        this.$toast.add({severity: 'warn', summary: 'Error', detail: res.error || 'Unable to update', life: 2000});
      }
    },

    async deleteAssignment(assignment) {
      const ok = confirm('Delete this assignment? This cannot be undone.');
      if (!ok) return;
      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments`, {
        method: 'DELETE',
        body: {
          teacher_code: this.teacher_code,
          id: assignment.id
        }
      });
      this.loading = false;
      if (res && res.success) {
        this.assignments = this.assignments.filter(a => a.id !== assignment.id);
        if (this.selected_assignment?.id === assignment.id) this.selected_assignment = null;
        this.$toast.add({severity: 'success', summary: 'Deleted', detail: 'Assignment deleted', life: 2000});
      } else {
        this.$toast.add({severity: 'warn', summary: 'Error', detail: res.error || 'Unable to delete', life: 2000});
      }
    },

    async onAssignmentFiles(e, assignment) {
      const files = e.target.files;
      if (!files || !files.length) return;
      const fd = new FormData();
      fd.append('assignment_id', assignment.id);
      Array.from(files).forEach(f => fd.append('files', f, f.name));

      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments/files`, {method: 'POST', body: fd});
      this.loading = false;

      if (res && res.attachments) {
        assignment.attachments = res.attachments;
        this.$toast.add({severity: 'success', summary: 'Uploaded', detail: 'Files uploaded', life: 2000});
      } else {
        this.$toast.add({severity: 'warn', summary: 'Upload error', detail: res.error || 'Unable to upload', life: 2000});
      }
    },

    async loadSubmissions(assignment) {
      this.selected_assignment = assignment;
      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments/submissions?assignment_id=${encodeURIComponent(assignment.id)}&teacher_code=${encodeURIComponent(this.teacher_code)}`);
      this.loading = false;
      this.submissions = Array.isArray(res) ? res : [];
      this.seedGrading();
      this.buildAnalysis();
    },

    async loadAssignmentByCode() {
      if (!this.student_code) return;
      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments?code=${encodeURIComponent(this.student_code)}`);
      this.loading = false;
      if (res && !res.error) {
        this.assignment = res;
        this.answers = {};
        this.student_text = '';
        this.student_files = [];
      } else {
        this.assignment = null;
        this.$toast.add({severity: 'warn', summary: 'Not found', detail: 'Invalid assignment code', life: 2000});
      }
    },

    onStudentFiles(e) {
      const files = e.target.files;
      this.student_files = files ? Array.from(files) : [];
    },

    async submitAssignment() {
      if (!this.assignment) return;
      const questions = this.assignment.questions || [];

      let score = 0;
      let total = 0;
      const answers = questions.map(q => {
        const answer = this.answers[q.id] || '';
        if (q.type === 'mcq') {
          total += 1;
          const correct = String(answer).trim() === String(q.answer || '').trim();
          if (correct) score += 1;
          return {question_id: q.id, answer, correct};
        }
        return {question_id: q.id, answer};
      });

      const className = this.session?.class_?.name || '';
      const group = className.includes(' - ') ? className.split(' - ').slice(1).join(' - ').trim() : '';

      const meta = {
        assignment_id: this.assignment.id,
        school: this.session?.school?.name || '',
        class_: className,
        group,
        answers,
        score,
        total,
        text: this.student_text
      };

      const fd = new FormData();
      fd.append('meta', JSON.stringify(meta));
      this.student_files.forEach(f => fd.append('files', f, f.name));

      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments/submissions`, {method: 'POST', body: fd});
      this.loading = false;

      if (res && res.data) {
        this.$toast.add({severity: 'success', summary: 'Submitted', detail: 'Assignment submitted', life: 2000});
      } else {
        this.$toast.add({severity: 'warn', summary: 'Error', detail: res.error || 'Submit failed', life: 2000});
      }
    }
    ,

    buildAnalysis() {
      const assignment = this.selected_assignment;
      if (!assignment || !assignment.questions || !assignment.questions.length) {
        this.analysis = [];
        return;
      }

      const byQuestion = assignment.questions.map(q => ({
        id: q.id,
        prompt: q.prompt,
        correct: {},
        wrong: {}
      }));

      const addBucket = (bucket, key) => {
        if (!bucket[key]) bucket[key] = 0;
        bucket[key] += 1;
      };

      this.submissions.forEach(s => {
        const label = s.group ? `${s.class_} - ${s.group}` : s.class_;
        const answers = s.answers || [];
        answers.forEach(a => {
          const idx = byQuestion.findIndex(q => q.id === a.question_id);
          if (idx === -1) return;
          if (a.correct) addBucket(byQuestion[idx].correct, label || 'Unknown');
          else addBucket(byQuestion[idx].wrong, label || 'Unknown');
        });
      });

      this.analysis = byQuestion;
    }
    ,

    seedGrading() {
      const assignment = this.selected_assignment;
      if (!assignment) return;
      const shortIds = new Set((assignment.questions || []).filter(q => q.type !== 'mcq').map(q => q.id));
      const map = {};
      this.submissions.forEach(s => {
        const scores = {...(s.manual?.scores || {})};
        shortIds.forEach(id => {
          if (scores[id] === undefined) scores[id] = 0;
        });
        map[s.id] = {
          scores,
          feedback: s.manual?.feedback || ''
        };
      });
      this.grading = map;
    },

    async saveManualGrade(submission) {
      const assignment = this.selected_assignment;
      if (!assignment) return;
      const shortQs = (assignment.questions || []).filter(q => q.type !== 'mcq');
      const state = this.grading[submission.id];
      if (!state) return;

      let total = 0;
      let score = 0;
      shortQs.forEach(q => {
        total += 1;
        const val = Number(state.scores[q.id] || 0);
        if (val > 0) score += 1;
      });

      this.loading = true;
      const res = await $fetch(`${this.server_url}assignments/submissions`, {
        method: 'PUT',
        body: {
          teacher_code: this.teacher_code,
          id: submission.id,
          manual: {
            score,
            total,
            feedback: state.feedback || '',
            scores: state.scores || {}
          }
        }
      });
      this.loading = false;
      if (res && res.data) {
        const idx = this.submissions.findIndex(s => s.id === submission.id);
        if (idx !== -1) this.submissions.splice(idx, 1, res.data);
        this.$toast.add({severity: 'success', summary: 'Saved', detail: 'Manual grade saved', life: 2000});
      } else {
        this.$toast.add({severity: 'warn', summary: 'Error', detail: res.error || 'Unable to save grade', life: 2000});
      }
    }
  }
});
</script>

<style scoped>
input[type="file"] {
  display: block;
}
</style>
