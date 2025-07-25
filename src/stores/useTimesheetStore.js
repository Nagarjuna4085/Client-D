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
            // debugger;
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
                        grandTotal: timesheet.get('grandTotal')
                    };
                }
            } catch (err) {
                this.error = err.message;
                console.error('Fetch/Create Timesheet error:', err);
            } finally {
                this.loading = false;
            }
        },

        async updateLogEntries(objectId, newEntries, grandTotalHours) {
            console.log(objectId, newEntries, grandTotalHours);
            try {
                debugger;
                const Parse = await getParse();

                const Timesheet = Parse.Object.extend('Timesheet');
                const query = new Parse.Query(Timesheet);
                const sheet = await query.get(objectId);

                sheet.set('logEntries', newEntries);
                sheet.set('grandTotal', grandTotalHours);
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
