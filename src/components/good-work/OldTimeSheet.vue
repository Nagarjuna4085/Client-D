<script setup>
import { getCycleForDate, parseLocalDate } from '@/jsutils/timesheetUtils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTimesheetStore } from '@/stores/useTimesheetStore';
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const timeSheetStore = useTimesheetStore();
const route = useRoute();
const timesheetId = route.params.id;
const currentDate = ref(new Date());

const authStore = useAuthStore();
// 1. Get start of current cycle (based on today)
const currentCycle = ref(getCycleForDate(currentDate.value, authStore?.propertyInfo?.initialCycleStartDate));
watch(currentDate, (newDate) => {
    currentCycle.value = getCycleForDate(newDate, authStore?.propertyInfo?.initialCycleStartDate);
});
function formatDateLocal(date) {
    return date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
}

function generateInitialEntries(start, days = 14) {
    const entries = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        console.log('formatdate', formatDateLocal(date));
        entries.push({
            id: 1000 + i,
            inTime: null,
            outTime: null,
            date: formatDateLocal(date), // store local YYYY-MM-DD string here
            name: `Entry 1`,
            icon: 'pi pi-calendar'
        });
    }
    return entries;
}

const objectId = ref();

const timeEntries = reactive({
    data: [],
    uniqId: 1024
});
const updateEntries = async () => {
    // debugger;
    console.log('seadwDWESF', timeEntries.data);
    if (objectId.value) {
        const result = await timeSheetStore.updateLogEntries(objectId.value, timeEntries.data);
        console.log('result........................!!!!!!!!!!!!!!!', result);
    }
};

onBeforeMount(() => {});
onMounted(async () => {
    // debugger;
    if (timesheetId && currentCycle.value.start && currentCycle.value.end) {
        let result = await timeSheetStore.getOrCreateTimesheet(timesheetId, currentCycle.value.start, currentCycle.value.end);
        console.log('...........', result);
        objectId.value = result?.objectId;

        timeEntries.data = result?.logEntries ? result?.logEntries : generateInitialEntries(currentCycle.value.start);
    }
});
console.log('Load timesheet for ID:', timesheetId);

const calculateDailyHours = (date) => {
    const entries = timeEntries.data.filter((entry) => entry.date === date && entry.inTime && entry.outTime);

    let totalMilliseconds = 0;

    entries.forEach((entry) => {
        const inTime = new Date(entry.inTime);
        const outTime = new Date(entry.outTime);

        const diffMilliseconds = outTime - inTime;
        if (diffMilliseconds > 0) {
            totalMilliseconds += diffMilliseconds;
        }
    });

    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const calculateWeeklyHours = () => {
    let totalMilliseconds = 0;

    timeEntries.data.forEach((entry) => {
        if (entry.inTime && entry.outTime) {
            const inTime = new Date(entry.inTime);
            const outTime = new Date(entry.outTime);

            const diffMilliseconds = outTime - inTime;
            if (diffMilliseconds > 0) {
                totalMilliseconds += diffMilliseconds;
            }
        }
    });

    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const sortCustomersByDate = () => {
    timeEntries.data.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const disabledIds = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014];

const deleteEntry = (id) => {
    console.log('id', id);
    const index = timeEntries.data.findIndex((customer) => customer.id === id);
    console.log('index', index);
    if (index !== -1) {
        timeEntries.data.splice(index, 1);
    }
};
const clearAllTimes = () => {
    timeEntries.data.forEach((entry) => {
        entry.inTime = null;
        entry.outTime = null;
    });
};

const onDateChange = (newDate) => {
    console.log('Date changed:', newDate);
};

const addNewEntry = (date, id) => {
    timeEntries.uniqId = id;
    const totalEntries = timeEntries.data.filter((entry) => entry.date === date).length;

    timeEntries.data.push({
        id: id,
        inTime: null,
        outTime: null,
        name: `Entry ${totalEntries + 1}`,
        date: date,
        icon: 'pi pi-calendar'
    });

    sortCustomersByDate();
};
</script>

<template>
    <div class="card">
        <!-- <div class="font-semibold text-xl mb-4 text-primary">Weekly Time Log</div> -->
        <div class="flex justify-between items-center mb-4">
            <div class="font-bold text-4xl text-primary">Weekly Time Log <button @click="updateEntries">Save</button></div>
            <Button label="Clear All Times" icon="pi pi-times" @click="clearAllTimes" />
        </div>
        <div class="m-1">
            <FloatLabel>
                <Calendar v-model="currentDate" showIcon hourFormat="12" iconDisplay="input" @update:modelValue="onDateChange" :inputId="`inTime-`" />
                <label :for="`inTime-xfgfhjk}`">today Date</label>
            </FloatLabel>
        </div>
        <DataTable :value="timeEntries.data" rowGroupMode="subheader" groupRowsBy="date" :sortOrder="1" scrollable scrollHeight="calc(100vh - 8rem)" tableStyle="min-width: 50rem">
            <template #groupheader="slotProps">
                <div class="flex items-center gap-3">
                    <i :class="[slotProps.data.icon, 'text-primary']" style="font-size: 2rem"></i>
                    <span style="font-size: 1.5rem; font-weight: 600">
                        {{ parseLocalDate(slotProps.data.date).toDateString() }}
                    </span>
                </div>
            </template>

            <!-- <Column field="representative.name" header=""></Column> -->
            <Column field="name" header="" style="min-width: 100px" headerClass="medium-header" />
            <Column field="" header="" style="min-width: 100px">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <FloatLabel>
                            <Calendar v-model="slotProps.data.inTime" showIcon hourFormat="12" iconDisplay="input" timeOnly :inputId="`inTime-${slotProps.data.id}`" />
                            <label :for="`inTime-${slotProps.data.id}`">In Time</label>
                        </FloatLabel>
                    </div>
                </template>
            </Column>
            <Column field="" header="" style="min-width: 100px">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <FloatLabel>
                            <Calendar v-model="slotProps.data.outTime" showIcon iconDisplay="input" timeOnly hourFormat="12" inputId="outTime-{{ slotProps.data.id }}" />
                            <label :for="`outTime-${slotProps.data.id}`">Out Time</label>
                        </FloatLabel>
                    </div>
                </template>
            </Column>
            <Column field="" header="" style="min-width: 100px">
                <template #body="slotProps">
                    <div class="flex items-center">
                        <Button label="Delete Entry" :disabled="disabledIds.includes(slotProps.data.id)" @click="deleteEntry(slotProps.data.id)" icon="pi pi-trash" text raised />
                    </div>
                </template>
            </Column>
            <template #groupfooter="slotProps">
                <div class="flex justify-between items-center w-full col-span-2">
                    <div>
                        <Button size="small" label="New Entry" icon="pi pi-plus" @click="addNewEntry(slotProps.data.date, timeEntries.uniqId + 1)" />
                    </div>
                    <div class="flex justify-end font-semibold text-primary" style="font-size: 1.2rem">Daily Hours: {{ calculateDailyHours(slotProps.data.date) }}</div>
                </div>
            </template>

            <ColumnGroup type="footer">
                <Row>
                    <Column :colspan="5" :footer="`Weekly Hours: ${calculateWeeklyHours()}`" footerStyle="text-align: right; font-weight: bold; font-size: 1.5rem;" footerClass="weekly-footer" />
                </Row>
            </ColumnGroup>
        </DataTable>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}

:deep(.p-datatable tfoot tr td.weekly-footer) {
    margin-top: 1rem; /* might not affect tables, so use padding below */
    // padding-top: 1rem;
    font-weight: bold;
    color: #28a745; /* Bootstrap green or change to your preferred shade */
    // background-color: #f0fdf4; /* light green background (optional) */
    border-top: 2px solid #d1e7dd; /* subtle top border for separation (optional) */
    text-align: right;
}
.medium-header {
    font-size: 1.2rem; /* medium size */
    font-weight: 600; /* semi-bold */
}
</style>
