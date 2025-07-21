// @/stores/useEmployeeStore.js
import { getParse } from '@/parseConfig';

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useEmployeeStore = defineStore('employee', () => {
    const employees = ref([]);
    const loading = ref(false);
    const selectedEmployee = ref(null);

    // ✅ Getters
    const totalEmployees = computed(() => employees.value.length);
    const employeesByGender = computed(() => {
        return employees.value.reduce((acc, emp) => {
            const gender = emp.get('gender')?.value || 'unknown';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});
    });

    // ✅ Actions
    async function fetchEmployees() {
        loading.value = true;
        try {
            const Parse = await getParse();
            // const user = Parse.User.current();

            const currentUser = Parse.User.current();
            console.log('User property:', currentUser.get('property'));

            const propertyObj = currentUser.get('property');
            if (!propertyObj) {
                console.warn('No property found for current user');
                employees.value = [];
                return;
            }
            const propertyPointer = propertyObj instanceof Parse.Object ? propertyObj : new Parse.Object('Property');
            if (!(propertyObj instanceof Parse.Object)) {
                propertyPointer.id = propertyObj.objectId || propertyObj.id;
            }

            const query = new Parse.Query('Employee');
            query.equalTo('property', propertyObj); // filter by property

            query.include('property');
            query.include('createBy');
            const results = await query.find();
            employees.value = results;
        } catch (err) {
            console.error('Error fetching employees:', err.message);
        } finally {
            loading.value = false;
        }
    }

    async function createEmployee(data) {
        try {
            const Parse = await getParse();

            const Employee = Parse.Object.extend('Employee');
            const emp = new Employee();

            emp.set('firstName', data.firstName);
            emp.set('lastName', data.lastName);
            emp.set('phoneNumber', data.phoneNumber);
            emp.set('position', data.position);
            emp.set('gender', data.gender);
            emp.set('payType', data.payType);
            emp.set('payRate', data.payRate);

            // Lookup property by code
            const propQuery = new Parse.Query('Property');
            propQuery.equalTo('code', data.property.value);
            const property = await propQuery.first();

            if (!property) throw new Error('Property not found');
            emp.set('property', property);

            emp.set('createBy', Parse.User.current());

            const saved = await emp.save();
            employees.value.push(saved);
            return saved;
        } catch (err) {
            console.error('Error creating employee:', err.message);
            throw err;
        }
    }

    async function updateEmployee(id, updates) {
        try {
            console.log('id', id);
            console.log('updates', updates);
            const Parse = await getParse();

            const query = new Parse.Query('Employee');
            const emp = await query.get(id);
            console.log('emp', emp);

            Object.entries(updates).forEach(([key, val]) => {
                if (key === 'property' && val?.value) {
                    const Property = Parse.Object.extend('Property');
                    const propPointer = new Property();
                    propPointer.id = val.value;
                    emp.set('property', propPointer);
                } else {
                    emp.set(key, val);
                }
            });
            console.log('emp', emp);

            //    return await emp.save();
            // console.log('employess', employees);
            // if (employees?.value) {
            //     const index = employees.value.findIndex((e) => e.id === id);
            //     if (index !== -1) employees.value[index] = updated;
            // }

            // return updated;
        } catch (err) {
            console.error('Error updating employee:', err.message);
            throw err;
        }
    }

    async function deleteEmployee(id) {
        const Parse = await getParse();
        const query = new Parse.Query('Employee');

        try {
            const emp = await query.get(id);
            if (emp) {
                await emp.destroy();
            } else {
                throw new Error('Employee not found');
            }
        } catch (err) {
            console.error('Error deleting employee:', err.message);
            throw err;
        }
    }

    async function deleteMultiple(ids = []) {
        try {
            const toDelete = employees.value.filter((e) => ids.includes(e.id));
            const deletions = toDelete.map((e) => e.destroy());
            await Promise.all(deletions);
            employees.value = employees.value.filter((e) => !ids.includes(e.id));
        } catch (err) {
            console.error('Error deleting multiple employees:', err.message);
            throw err;
        }
    }

    return {
        employees,
        loading,
        selectedEmployee,
        totalEmployees,
        employeesByGender,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        deleteMultiple
    };
});
