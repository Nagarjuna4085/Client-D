<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch, reactive, nextTick } from 'vue';
import { getCycleForDate, parseLocalDate } from '@/jsutils/timesheetUtils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTimesheetStore } from '@/stores/useTimesheetStore';
const expandedRows = ref({});
const toast = useToast();
const currentDate = ref(new Date());
const timeSheetStore = useTimesheetStore();
const authStore = useAuthStore();
const objectId = ref();
const disabledIds = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014];
const timeEntries = reactive({
    data: [],
    uniqId: 1024
});
const expandedRowRefs = ref({});
const setExpandedRowRef = (id, el) => {
    if (el) {
        expandedRowRefs.value[id] = el;
    }
};

const currentCycle = ref(getCycleForDate(currentDate.value, authStore?.propertyInfo?.initialCycleStartDate));
watch(currentDate, (newDate) => {
    currentCycle.value = getCycleForDate(newDate, authStore?.propertyInfo?.initialCycleStartDate);
});

onMounted(async () => {
    timeEntries.data = await generateInitialEntries(currentCycle.value.start);
    console.log('data', timeEntries.data);
    sortCustomersByDate();

    // Format the current date to match stored entry format
    const today = formatDateLocal(currentDate.value);

    // Find the row entry for today
    const todayEntry = timeEntries.data.find((entry) => entry.date === today);
    if (todayEntry) {
        expandedRows.value = { [todayEntry.id]: true };

        await nextTick(); // wait for DOM update
        await nextTick(); // wait for expanded content

        const el = expandedRowRefs.value[todayEntry.id];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            console.warn('Expanded row element not found for scrolling');
        }
    }
});

const onRowExpand = (event) => {
    toast.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.id, life: 3000 });
};
const onRowCollapse = (event) => {
    toast.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.id, life: 3000 });
};
const expandAll = () => {
    expandedRows.value = timeEntries.data.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};
const collapseAll = () => {
    expandedRows.value = null;
};
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatDateLocal = (date) => {
    return date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
};

const generateInitialEntries = (start, days = 14) => {
    debugger;
    const entries = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        let day = {
            date: formatDateLocal(date), // store local YYYY-MM-DD string here
            timeEntries: [],
            id: 10000 + i
        };
        date.setDate(start.getDate() + i);
        console.log('formatdate', formatDateLocal(date));
        day.timeEntries.push({
            id: 1000 + i,
            inTime: null,
            outTime: null,
            entryCount: `Entry 1`,
            icon: 'pi pi-calendar'
        });
        entries.push(day);
    }
    console.log('entries', entries);
    return entries;
};
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
const deleteEntry = (date, childId) => {
    debugger;
    const index = timeEntries.data.findIndex((entry) => entry.date === date);

    if (index !== -1) {
        const entryList = timeEntries.data[index].timeEntries;
        timeEntries.data[index].timeEntries = entryList.filter((e) => e.id !== childId);
        timeEntries.data[index].timeEntries.forEach((e, i) => {
            e.entryCount = `Entry ${i + 1}`;
        });
    }
};
const clearAllTimesForAllDates = () => {
    timeEntries.data.forEach((day) => {
        day.timeEntries.forEach((entry) => {
            entry.inTime = null;
            entry.outTime = null;
            // Optional: reset icon or other fields if needed
            // entry.icon = 'pi pi-calendar';
        });
    });
};

const onDateChange = (newDate) => {
    console.log('Date changed:', newDate);
    timeEntries.data = [];
};

const addNewEntry = (date, id) => {
    timeEntries.uniqId = id;
    const index = timeEntries.data.findIndex((entry) => entry.date === date);
    const totalEntries = timeEntries.data[index].timeEntries.length;

    if (index !== -1) {
        timeEntries.data[index].timeEntries.push({
            id: id,
            inTime: null,
            outTime: null,
            entryCount: `Entry ${totalEntries + 1}`,
            icon: 'pi pi-calendar'
        });
    }

    sortCustomersByDate();
};
const clearEntry = (date, childId) => {
    const index = timeEntries.data.findIndex((entry) => entry.date === date);

    if (index !== -1) {
        const entryList = timeEntries.data[index].timeEntries;
        const childIndex = entryList.findIndex((e) => e.id === childId);

        if (childIndex !== -1) {
            entryList[childIndex].inTime = null;
            entryList[childIndex].outTime = null;
            // Reset any other fields if needed
        }
    }
};
</script>

<template>
    <div class="card">
        <template> </template>
        <DataTable v-model:expandedRows="expandedRows" :value="timeEntries.data" dataKey="id" @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem">
            <template #header>
                <div>
                    <div class="flex justify-between mb-4">
                        <div>Time Sheet</div>
                        <div class="">
                            <Calendar v-model="currentDate" showIcon iconDisplay="input" @update:modelValue="onDateChange" />
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <div class="flex flex-wrap justify-end gap-2">
                            <Button text icon="pi pi-plus" label="Expand All" raised @click="expandAll" />
                            <Button text icon="pi pi-minus" label="Collapse All" raised @click="collapseAll" />
                            <Button text icon="pi pi-times" label="Clear All Times" raised @click="clearAllTimesForAllDates" />
                        </div>
                        <div class="flex">
                            <Button disabled="true" label="Total Hours" badge="88:88" icon="pi pi-clock" severity="info" variant="text" raised />
                            <Button text icon="pi pi-check" class="" label="Submit" @click="" raised />
                        </div>
                    </div>
                </div>
            </template>
            <Column expander style="width: 5rem" />
            <Column field="date" header="" headerClass="">
                <template #body="slotProps">
                    <span class="text-primary text-2xl">
                        {{ parseLocalDate(slotProps.data.date).toDateString() }}
                    </span>
                </template>
            </Column>
            <Column header=""> </Column>
            <Column field="price" header="">
                <template #body="slotProps">
                    <!-- {{ formatCurrency(slotProps.data.price) }} -->
                </template>
            </Column>
            <Column field="" header=""></Column>
            <Column field="" header="">
                <template #body="slotProps">
                    <!-- <Rating :modelValue="slotProps.data.rating" readonly /> -->
                </template>
            </Column>
            <Column header="">
                <template #body="slotProps">
                    <!-- <Tag :value="slotProps.data.inventoryStatus" :severity="getSeverity(slotProps.data)" /> -->
                </template>
            </Column>
            <template #expansion="slotProps">
                <div class="p-4" :ref="(el) => setExpandedRowRef(slotProps.data.id, el)">
                    <div class="flex items-center justify-between mb-4">
                        <h6 class="text-lg font-semibold">List of Entries</h6>
                        <Button label="New Entry" icon="pi pi-plus" severity="secondary" @click="addNewEntry(slotProps.data.date, timeEntries.uniqId + 1)" text raised />
                    </div>

                    <DataTable :value="slotProps.data.timeEntries">
                        <Column field="entryCount" header="S.NO"></Column>
                        <Column field="" header="In">
                            <template #body="slotProps">
                                <div class="flex items-center gap-2">
                                    <FloatLabel>
                                        <Calendar v-model="slotProps.data.inTime" showIcon hourFormat="12" iconDisplay="input" timeOnly :inputId="`inTime-${slotProps.data.id}`" />
                                        <label :for="`inTime-${slotProps.data.id}`">In Time</label>
                                    </FloatLabel>
                                </div>
                            </template>
                        </Column>
                        <Column field="outTime" header="Out">
                            <template #body="slotProps">
                                <div class="flex items-center gap-2">
                                    <FloatLabel>
                                        <Calendar v-model="slotProps.data.outTime" showIcon hourFormat="12" iconDisplay="input" timeOnly :inputId="`outTime-${slotProps.data.id}`" />
                                        <label :for="`outTime-${slotProps.data.id}`">Out Time</label>
                                    </FloatLabel>
                                </div>
                            </template>
                        </Column>
                        <Column field="" header="Clear">
                            <template #body="childProps">
                                <div>
                                    <Button label="Clear" @click="clearEntry(slotProps.data.date, childProps.data.id)" icon="pi pi-times" text raised />
                                </div>
                            </template>
                        </Column>
                        <Column field="status" header="Delete">
                            <template #body="childProps">
                                <div>
                                    <Button label="Delete" :disabled="disabledIds.includes(childProps.data.id)" @click="deleteEntry(slotProps.data.date, childProps.data.id)" icon="pi pi-trash" text raised />
                                </div>
                            </template>
                        </Column>
                        <Column headerStyle="width:4rem" header="Hours">
                            <template #body>
                                <Button icon="pi pi-clock" label="00:00" severity="info" text raised />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>

        <Toast />
    </div>
</template>
