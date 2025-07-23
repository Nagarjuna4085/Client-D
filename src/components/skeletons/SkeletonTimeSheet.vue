<script setup>
import { ref } from 'vue';

const loading = ref(true); // simulate loading flag
const skeletonRows = ref(new Array(10)); // 10 skeleton rows
</script>
<template>
    <div class="card">
        <DataTable :value="skeletonRows" tableStyle="min-width: 60rem">
            <!-- Expander column -->
            <Column style="width: 5rem">
                <template #body>
                    <Skeleton shape="circle" width="1.5rem" height="1.5rem" />
                </template>
            </Column>

            <!-- Date column -->
            <Column field="date" header="">
                <template #body>
                    <Skeleton width="10rem" height="1.5rem" />
                </template>
            </Column>

            <!-- Placeholder columns -->
            <Column header="">
                <template #body>
                    <Skeleton width="8rem" height="1.5rem" />
                </template>
            </Column>

            <Column header="">
                <template #body>
                    <Skeleton width="6rem" height="1.5rem" />
                </template>
            </Column>

            <Column header="">
                <template #body>
                    <Skeleton width="4rem" height="1.5rem" />
                </template>
            </Column>

            <Column header="">
                <template #body>
                    <Skeleton width="6rem" height="1.5rem" />
                </template>
            </Column>

            <Column header="">
                <template #body>
                    <Skeleton width="5rem" height="1.5rem" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
