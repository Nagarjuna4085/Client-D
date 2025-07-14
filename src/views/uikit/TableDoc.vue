<script setup>
import { onBeforeMount, onMounted, reactive } from 'vue';

const customers3 = reactive({
    data: [
        {
            id: 1000,
            inTime: null,
            outTime: null,
            name: 'Entry 1',
            representative: {
                name: 'Monday'
            },
            icon: 'pi pi-calendar'
        },
        {
            id: 1002,
            inTime: null,
            outTime: null,
            name: 'Entry 1',
            representative: {
                name: 'Tuesday'
            },
            icon: 'pi pi-clock'
        },
        {
            id: 1003,
            inTime: null,
            outTime: null,
            name: 'Entry 1',
            representative: {
                name: 'Wednesday'
            },
            icon: 'pi pi-sun'
        },
        {
            id: 1004,
            inTime: null,
            outTime: null,
            name: 'Entry 1',
            representative: {
                name: 'Thursday'
            },
            icon: 'pi pi-cloud'
        },
        {
            id: 1005,
            inTime: null,
            outTime: null,
            name: 'Entry 1',
            representative: {
                name: 'Friday'
            },
            icon: 'pi pi-star'
        },
        {
            id: 1006,
            inTime: null,
            outTime: null,
            name: 'Entry 1',
            representative: {
                name: 'Saturday'
            },
            icon: 'pi pi-heart'
        },
        {
            id: 1007,
            inTime: null,
            outTime: null,
            name: 'Entry 1',
            representative: {
                name: 'Sunday'
            },
            icon: 'pi pi-moon'
        }
    ],
    uniqId: 1010
});

onBeforeMount(() => {
    sortCustomersByDay();
});
onMounted(() => {
    sortCustomersByDay();
});
const calculateDailyHours = (day) => {
    const entries = customers3.data.filter((entry) => entry.representative.name === day && entry.inTime && entry.outTime);

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

    customers3.data.forEach((entry) => {
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

const sortCustomersByDay = () => {
    customers3.data.sort((a, b) => {
        return weekdayOrder.indexOf(a.representative.name) - weekdayOrder.indexOf(b.representative.name);
    });
};

const disabledIds = [1000, 1001, 1002, 1003, 1004, 1005, 1006];
const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const countByRepresentative = (name) => {
    return customers3.data.filter((customer) => customer.representative.name === name).length;
};
const deleteEntry = (id) => {
    console.log('id', id);
    const index = customers3.data.findIndex((customer) => customer.id === id);
    console.log('index', index);
    if (index !== -1) {
        customers3.data.splice(index, 1);
    }
};
const clearAllTimes = () => {
    customers3.data.forEach((entry) => {
        entry.inTime = null;
        entry.outTime = null;
    });
};

const addNewEntry = (day, id) => {
    customers3.uniqId = id;
    console.log(countByRepresentative(day));
    let totalEntries = countByRepresentative(day);
    console.log('add', id);
    customers3.data.push({
        id: id,
        inTime: null, // ← Add this
        outTime: null, // ← And this
        name: `Entry ${totalEntries + 1}`,
        country: {
            name: 'Chile',
            code: 'cl'
        },
        company: 'Buckley Miller & Wright',
        date: '2016-07-25',
        status: 'negotiation',
        verified: false,
        activity: 59,
        representative: {
            name: day,
            image: 'amyelsner.png'
        },
        balance: 45250
    });
    sortCustomersByDay(); // Re-sort after adding
};
</script>

<template>
    <div class="card">
        <!-- <div class="font-semibold text-xl mb-4 text-primary">Weekly Time Log</div> -->
        <div class="flex justify-between items-center mb-4">
            <div class="font-bold text-4xl text-primary">Weekly Time Log</div>
            <Button label="Clear All Times" icon="pi pi-times" @click="clearAllTimes" />
        </div>

        <DataTable :value="customers3.data" rowGroupMode="subheader" groupRowsBy="representative.name" :sortOrder="1" scrollable scrollHeight="400px" tableStyle="min-width: 50rem">
            <template #groupheader="slotProps">
                <div class="flex items-center gap-3">
                    <i :class="[slotProps.data.icon, 'text-primary']" style="font-size: 2rem"></i>
                    <span style="font-size: 1.5rem; font-weight: 600">
                        {{ slotProps.data.representative.name }}
                    </span>
                </div>
            </template>

            <Column field="representative.name" header="Representative"></Column>
            <Column field="name" header="Day" style="min-width: 100px" headerClass="medium-header" />
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

            <!-- <Column field="status" header="Status" style="min-width: 200px">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
                </template>
            </Column> -->
            <!-- <Column field="date" header="Date" style="min-width: 200px"></Column> -->
            <template #groupfooter="slotProps">
                <div class="flex justify-between items-center w-full">
                    <div>
                        <!-- <Button icon="pi pi-plus" text raised rounded /> -->
                        <Button size="small" label="New Entry" icon="pi pi-plus" @click="addNewEntry(slotProps.data.representative.name, customers3.uniqId + 1)" />
                    </div>
                    <div class="flex justify-end font-semibold text-primary" style="font-size: 1.2rem">Daily Hours: {{ calculateDailyHours(slotProps.data.representative.name) }}</div>
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
// :deep(.p-datatable thead th) {
//     // color: red !important;
//     // font-weight: bold !important;
//     font-family: Verdana, Geneva, Tahoma, sans-serif;
// }

// :deep(.p-datatable thead th .p-column-header-content) {
//     justify-content: center !important;
// }
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
