// src/stores/useTimesheetStore.js
import { getParse } from '@/parseConfig';
// import Parse from '../parseConfig'; // adjust path if needed

import { defineStore } from 'pinia';

export const useTimesheetStore = defineStore('timesheet', {
    state: () => ({
        loading: false,
        error: null
    }),

    actions: {
        async getOrCreateTimesheet(empId, cycleStartDate, cycleEndDate) {
            debugger;
            this.loading = true;
            this.error = null;

            try {
                const Parse = await getParse();

                const Timesheet = Parse.Object.extend('Timesheet');
                const query = new Parse.Query(Timesheet);
                query.equalTo('empId', empId);
                query.equalTo('cycleStartDate', cycleStartDate);
                query.equalTo('cycleEndDate', cycleEndDate);

                let timesheet = await query.first();
                console.log('fromDb...............', timesheet.get('totalAmount'));

                if (!timesheet) {
                    timesheet = new Timesheet();
                    timesheet.set('empId', empId);
                    timesheet.set('cycleStartDate', cycleStartDate);
                    timesheet.set('cycleEndDate', cycleEndDate);
                    // timesheet.set('logEntries', []); // initialize empty log
                    const result = await timesheet.save();
                    console(timesheet.get('grandTotal'));
                    console.log('result', result);
                    return {
                        status: false,
                        objectId: result.id,
                        grandTotal: timesheet.get('grandTotal')
                    };
                } else {
                    return {
                        objectId: timesheet.id,
                        logEntries: timesheet.get('logEntries'),
                        grandTotal: timesheet.get('grandTotal'),
                        totalAmount: timesheet.get('totalAmount')
                    };
                }
            } catch (err) {
                this.error = err.message;
                console.error('Fetch/Create Timesheet error:', err);
            } finally {
                this.loading = false;
            }
        },

        async updateLogEntries(objectId, newEntries, grandTotalHours, empId) {
            const [hoursStr, minutesStr] = grandTotalHours.split(':');

            console.log(grandTotalHours, hoursStr, minutesStr);
            try {
                debugger;

                const Parse = await getParse();

                const Timesheet = Parse.Object.extend('Timesheet');
                // const Employee = Parse.Object.extend('Employee');
                const empQuery = new Parse.Query('Employee');

                empQuery.equalTo('objectId', empId); // match by propertyId string field
                const emp = await empQuery.find();
                console.log('emp///////', emp);
                console.log('firstName.....', emp[0].get('firstName'));

                const query = new Parse.Query(Timesheet);
                const sheet = await query.get(objectId);

                sheet.set('logEntries', newEntries);
                sheet.set('grandTotal', grandTotalHours);
                sheet.set('firstName', emp[0].get('firstName'));
                sheet.set('lastName', emp[0].get('lastName'));
                sheet.set('payRate', emp[0].get('payRate'));
                const calculateTotalSalary = (grandTotal, payRate) => {
                    debugger;
                    const [hoursStr, minutesStr] = grandTotal.split(':');
                    console.log(hoursStr, minutesStr);
                    const hours = parseInt(hoursStr, 10);
                    const minutes = parseInt(minutesStr, 10);
                    const totalHours = hours + minutes / 60;

                    const salary = totalHours * payRate;
                    return Number(salary.toFixed(2)); // Convert to number with 2 decimal points
                };
                let totalSalary = calculateTotalSalary(grandTotalHours, emp[0].get('payRate'));
                console.log(totalSalary, '........................................................');
                sheet.set('totalAmount', totalSalary);

                console.log(sheet.get('grandTotal'));
                await sheet.save();

                return sheet;
            } catch (err) {
                this.error = err.message;
                console.error('Update Timesheet error:', err);
                throw err;
            }
        },
        async deleteTimesheet() {}
    }
});
