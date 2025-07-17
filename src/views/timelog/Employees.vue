<script setup>
import { usePropertyStore } from '@/stores/usePropertyStore';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
const propertyStore = usePropertyStore();
onMounted(async () => {
    products.value = [
        {
            id: 'e1',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '1234567890',
            position: 'Manager',
            gender: { label: 'MALE', value: 'male' },
            payType: { label: 'Hourly', value: 'hourly' },
            payRate: 25.5,
            property: { label: 'INSTOCK', value: 'instock' }
        },
        {
            id: 'e2',
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '9876543210',
            position: 'Receptionist',
            gender: { label: 'FEMALE', value: 'female' },
            payType: { label: 'Daily', value: 'daily' },
            payRate: 100,
            property: { label: 'LOWSTOCK', value: 'lowstock' }
        }
    ];
    await propertyStore.fetchProperties();

    console.log('data', propertyStore.properties);

    if (Array.isArray(propertyStore.properties)) {
        properties.value = propertyStore.properties.map((p) => ({
            label: p.get('name'),
            value: p.get('code')
        }));
    }
});

const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const properties = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);
const paytypes = ref([
    { label: 'Hourly', value: 'houtly' },
    { label: 'Daily', value: 'Daily' },
    { label: 'Monthly', value: 'monthly' }
]);
const gendertypes = ref([
    { label: 'MALE', value: 'male' },
    { label: 'FEMALE', value: 'female' }
]);

const formatCurrency = (value) => {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
};
const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};
const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};
const saveProduct = () => {
    console.log(product.value);
    submitted.value = true;

    if (product?.value.firstName?.trim()) {
        if (product.value.id) {
            products.value[findIndexById(product.value.id)] = product.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            product.value.id = createId();
            product.value.code = createId();
            products.value.push(product.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }

        productDialog.value = false;
        product.value = {};
    }
};
const editProduct = (prod) => {
    product.value = { ...prod };
    productDialog.value = true;
};
const confirmDeleteProduct = (prod) => {
    product.value = prod;
    deleteProductDialog.value = true;
};
const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
};
const createId = () => {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};
const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                </template>

                <template #end>
                    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" customUpload chooseLabel="Import" class="mr-2" auto :chooseButtonProps="{ severity: 'secondary' }" />
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Employees</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="lastName" header="Id" sortable style="min-width: 12rem"></Column>
                <Column field="firstName" header="Full Name" sortable style="min-width: 16rem"></Column>
                <Column field="phoneNumber" header="Phone Number" sortable style="min-width: 16rem"></Column>
                <Column field="position" header="Position" sortable style="min-width: 16rem"></Column>
                <Column field="gender.label" header="Gender" sortable style="min-width: 16rem"></Column>
                <Column field="payType.label" header="Pay Type" sortable style="min-width: 16rem"></Column>
                <Column field="payRate" header="Pay Rate" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.payRate) }}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Product Details" :modal="true">
            <div class="flex flex-col gap-6">
                <img v-if="product.image" :src="`https://primefaces.org/cdn/primevue/images/product/${product.image}`" :alt="product.image" class="block m-auto pb-4" />
                <div>
                    <label for="First Name" class="block font-bold mb-3">First Name</label>
                    <InputText id="firstname" v-model.trim="product.firstName" required="true" autofocus :invalid="submitted && !product.firstName" fluid />
                    <small v-if="submitted && !product.firstName" class="text-red-500">first Name is required.</small>
                </div>
                <div>
                    <label for="Last Name" class="block font-bold mb-3">Last Name</label>
                    <InputText id="lastname" v-model.trim="product.lastName" required="true" autofocus :invalid="submitted && !product.lastName" fluid />
                    <small v-if="submitted && !product.lastName" class="text-red-500">last Name is required.</small>
                </div>
                <div>
                    <label for="inventoryStatus" class="block font-bold mb-3">Gender</label>
                    <Select id="inventoryStatus" v-model="product.gender" :options="gendertypes" optionLabel="label" placeholder="Select a gender" fluid></Select>
                </div>
                <div>
                    <label for="phoneNumber" class="block font-bold mb-3">Phone Number</label>
                    <InputText id="phoneNumber" v-model.trim="product.phoneNumber" required="true" autofocus :invalid="submitted && !product.phoneNumber" fluid />
                    <small v-if="submitted && !product.phoneNumber" class="text-red-500">phoneNumber is required.</small>
                </div>
                <div>
                    <label for="inventoryStatus" class="block font-bold mb-3">Property </label>
                    <Select id="inventoryStatus" v-model="product.property" :options="properties" optionLabel="label" placeholder="select a property" fluid></Select>
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">PayType</label>
                        <Select id="payTypes" v-model="product.payType" :options="paytypes" optionLabel="label" placeholder="Select a paytype" fluid></Select>
                    </div>
                    <div class="col-span-6">
                        <label for="quantity" class="block font-bold mb-3">Pay Rate</label>
                        <InputNumber id="price" v-model="product.payRate" mode="currency" currency="USD" locale="en-US" fluid />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Are you sure you want to delete <b>{{ product.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" severity="secondary" variant="text" />
                <Button label="Yes" icon="pi pi-check" @click="deleteProduct" severity="danger" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" severity="secondary" variant="text" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" severity="danger" />
            </template>
        </Dialog>
    </div>
</template>
