// import * as Parse from 'parse';
// import { defineStore } from 'pinia';

// export const useWeeklyWorkLogStore = defineStore('weeklyWorkLog', {
//     state: () => ({
//         logs: [],
//         loading: false,
//         error: null
//     }),

//     actions: {
//         async fetchLogsForEmployee(employeeId) {
//             this.loading = true;
//             this.error = null;
//             try {
//                 const WeeklyWorkLog = Parse.Object.extend('WeeklyWorkLog');
//                 const query = new Parse.Query(WeeklyWorkLog);

//                 const Employee = Parse.Object.extend('Employee');
//                 const employeePointer = new Employee();
//                 employeePointer.id = employeeId;
//                 query.equalTo('employee', employeePointer);

//                 query.descending('weekStart');
//                 query.limit(50);

//                 const results = await query.find();
//                 this.logs = results;
//             } catch (err) {
//                 this.error = err.message;
//             } finally {
//                 this.loading = false;
//             }
//         },

//         async saveLog(logData) {
//             this.loading = true;
//             this.error = null;
//             try {
//                 const WeeklyWorkLog = Parse.Object.extend('WeeklyWorkLog');
//                 const log = new WeeklyWorkLog();

//                 const Employee = Parse.Object.extend('Employee');
//                 const employeePointer = new Employee();
//                 employeePointer.id = logData.employeeId;

//                 log.set('employee', employeePointer);
//                 log.set('property', logData.property); // assume pointer object passed in
//                 log.set('weekStart', logData.weekStart);
//                 log.set('createdBy', logData.createdBy); // pointer to user

//                 log.set('logEntries', logData.logEntries); // array of entries

//                 await log.save();
//                 // Optionally refresh logs
//                 await this.fetchLogsForEmployee(logData.employeeId);
//             } catch (err) {
//                 this.error = err.message;
//             } finally {
//                 this.loading = false;
//             }
//         }
//     }
// });
