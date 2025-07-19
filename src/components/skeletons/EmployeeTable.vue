<script setup>
import { ref } from 'vue';

const products = ref(new Array(6));
</script>

<template>
    <div class="card">
        <DataTable :value="products">
            <Column field="code" header="Full Name">
                <template #body>
                    <Skeleton></Skeleton>
                </template>
            </Column>
            <Column field="name" header="Phone Number">
                <template #body>
                    <Skeleton></Skeleton>
                </template>
            </Column>
            <Column field="category" header="Position">
                <template #body>
                    <Skeleton></Skeleton>
                </template>
            </Column>
            <Column field="quantity" header="Gender">
                <template #body>
                    <Skeleton></Skeleton>
                </template>
            </Column>
            <Column field="payType" header="Pay Type">
                <template #body>
                    <Skeleton></Skeleton>
                </template>
                <Column field="payRype" header="Pay Rate">
                    <template #body>
                        <Skeleton></Skeleton>
                    </template>
                </Column>
            </Column>
        </DataTable>
    </div>
</template>
