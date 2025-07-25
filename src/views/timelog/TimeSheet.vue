<script setup>
import { getCycleForDate, parseLocalDate } from '@/jsutils/timesheetUtils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from 'primevue/usetoast';
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();

import SkeletonTimeSheet from '@/components/skeletons/SkeletonTimeSheet.vue';
import { useTimesheetStore } from '@/stores/useTimesheetStore';
const expandedRows = ref({});
const isLoading = ref(true);
const isDateChanged = ref(true);
const timesheetId = route.params.id;

const toast = useToast();
const currentDate = ref(new Date());
const timeSheetStore = useTimesheetStore();
const authStore = useAuthStore();
const objectId = ref();
const disabledIds = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014];
const timeEntries = reactive({
    data: [],
    uniqId: 1024,
    grandTotal: null
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
    debugger;
    isLoading.value = true;

    if (timesheetId && currentCycle.value.start && currentCycle.value.end) {
        let result = await timeSheetStore.getOrCreateTimesheet(timesheetId, currentCycle.value.start, currentCycle.value.end);
        console.log('...........', result);
        objectId.value = result?.objectId;

        timeEntries.data = result?.logEntries?.length ? result?.logEntries : generateInitialEntries(currentCycle.value.start);
        timeEntries.grandTotal = result?.grandTotal;
    }

    // timeEntries.data = await generateInitialEntries(currentCycle.value.start);
    console.log('data', timeEntries.data);
    if (timeEntries.data.length) sortCustomersByDate();
    isLoading.value = false;

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
            id: 10000 + i,
            dayTotal: null
        };
        date.setDate(start.getDate() + i);
        console.log('formatdate', formatDateLocal(date));
        day.timeEntries.push({
            id: 1000 + i,
            inTime: null,
            outTime: null,
            entryCount: `Entry 1`,
            icon: 'pi pi-calendar',
            entryTolal: null
        });
        entries.push(day);
    }
    console.log('entries', entries);
    return entries;
};
// const calculateDailyHours = (parentId) => {

//     const index = timeEntries.data.findIndex((entry) => entry.id === parentId);

//     if (index !== 1) {
//         const entries = timeEntries.data[index].timeEntries;
//         let totalMilliseconds = 0;
//         entries.forEach((entry) => {
//             const inTime = new Date(entry.inTime);
//             const outTime = new Date(entry.outTime);
//             const diffMilliseconds = outTime - inTime;
//             if (diffMilliseconds > 0) {
//                 totalMilliseconds += diffMilliseconds;
//             }
//         });

//         const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
//         const hours = Math.floor(totalMinutes / 60);
//         const minutes = totalMinutes % 60;

//         return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//     }
// };
const calculateSingleEntryHours = (entry) => {
    if (!entry?.inTime || !entry?.outTime) return '00:00';

    const inTime = new Date(entry.inTime);
    const outTime = new Date(entry.outTime);
    const diffMilliseconds = outTime - inTime;

    if (diffMilliseconds <= 0) return '00:00';

    const totalMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
const calculateDayTotal = (day) => {
    let totalMinutes = 0;

    day.timeEntries.forEach((entry) => {
        if (entry.inTime && entry.outTime) {
            const inTime = new Date(entry.inTime);
            const outTime = new Date(entry.outTime);
            const diff = outTime - inTime;

            if (diff > 0) {
                totalMinutes += Math.floor(diff / (1000 * 60));
            }
        }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// const calculateWeeklyHours = () => {
//     let totalMilliseconds = 0;

//     timeEntries.data.forEach((entry) => {
//         if (entry.inTime && entry.outTime) {
//             const inTime = new Date(entry.inTime);
//             const outTime = new Date(entry.outTime);

//             const diffMilliseconds = outTime - inTime;
//             if (diffMilliseconds > 0) {
//                 totalMilliseconds += diffMilliseconds;
//             }
//         }
//     });

//     const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;

//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
// };

const calculateGrandTotal = () => {
    let totalMinutes = 0;

    timeEntries.data.forEach((day) => {
        day.timeEntries.forEach((entry) => {
            if (entry.inTime && entry.outTime) {
                const inTime = new Date(entry.inTime);
                const outTime = new Date(entry.outTime);
                const diff = outTime - inTime;

                if (diff > 0) {
                    totalMinutes += Math.floor(diff / (1000 * 60));
                }
            }
        });
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const findIndexes = (parentId, childId) => {
    const parentIndex = timeEntries.data.findIndex((p) => p.id === parentId);
    const childIndex = parentIndex !== -1 ? timeEntries.data[parentIndex].timeEntries.findIndex((c) => c.id === childId) : -1;
    return [parentIndex, childIndex];
};

const handleTimeChange = (entry, parentId) => {
    const [parentIndex, childIndex] = findIndexes(parentId, entry.id);
    console.log(parentIndex, childIndex);
    if (parentIndex !== -1 && childIndex !== -1) {
        let entrySum = calculateSingleEntryHours(entry);
        let dailySum = calculateDayTotal(timeEntries.data[parentIndex]);
        let grandSum = calculateGrandTotal();
        console.log('entrySum', entrySum);
        console.log('dailySum', dailySum);
        console.log('grandSum', grandSum);
        timeEntries.data[parentIndex].timeEntries[childIndex].entryTolal = entrySum;
        timeEntries.data[parentIndex].dayTotal = dailySum;
        timeEntries.grandTotal = grandSum;
        console.log(timeEntries.data[parentIndex].timeEntries[childIndex].entryTolal);
    }
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
            icon: 'pi pi-calendar',
            entryTolal: null
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
const updateEntries = async () => {
    // debugger;
    console.log('seadwDWESF', timeEntries.data);
    if (objectId.value) {
        const result = await timeSheetStore.updateLogEntries(objectId.value, timeEntries.data, timeEntries.grandTotal);
        console.log('result........................!!!!!!!!!!!!!!!', result);
    }
};
</script>

<template>
    <div class="card">
        <div v-if="isLoading">
            <SkeletonTimeSheet />
        </div>
        <DataTable v-else v-model:expandedRows="expandedRows" :value="timeEntries.data" dataKey="id" @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" tableStyle="min-width: 60rem">
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
                            <Button disabled="true" label="Total Hours" :badge="timeEntries.grandTotal" icon="pi pi-clock" severity="info" variant="text" raised />
                            <Button text icon="pi pi-check" class="" label="Submit" @click="updateEntries" raised />
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
                            <template #body="childSlot">
                                <div class="flex items-center gap-2">
                                    <FloatLabel>
                                        <Calendar
                                            v-model="childSlot.data.inTime"
                                            showIcon
                                            hourFormat="12"
                                            iconDisplay="input"
                                            timeOnly
                                            :inputId="`inTime-${childSlot.data.id}`"
                                            @update:modelValue="() => handleTimeChange(childSlot.data, slotProps.data.id)"
                                        />
                                        <label :for="`inTime-${childSlot.data.id}`">In Time</label>
                                    </FloatLabel>
                                </div>
                            </template>
                        </Column>
                        <Column field="outTime" header="Out">
                            <template #body="childSlot">
                                <div class="flex items-center gap-2">
                                    <FloatLabel>
                                        <Calendar
                                            v-model="childSlot.data.outTime"
                                            showIcon
                                            hourFormat="12"
                                            iconDisplay="input"
                                            timeOnly
                                            :inputId="`outTime-${childSlot.data.id}`"
                                            @update:modelValue="() => handleTimeChange(childSlot.data, slotProps.data.id)"
                                        />
                                        <label :for="`outTime-${childSlot.data.id}`">Out Time</label>
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
                            <template #body="childProps">
                                <Button icon="pi pi-clock" :label="childProps.data.entryTolal" severity="info" text raised />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>

            <template #empty>
                <div v-if="isDateChanged"><SkeletonTimeSheet /></div>
                <div v-else class="text-center text-gray-400 py-4">No entries available</div>
            </template>
        </DataTable>

        <Toast />
    </div>
</template>
