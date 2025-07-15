// import * as Parse from 'parse';
// import { defineStore } from 'pinia';

// export const usePropertyStore = defineStore('property', {
//     state: () => ({
//         properties: [],
//         loading: false,
//         error: null
//     }),

//     actions: {
//         async fetchProperties() {
//             this.loading = true;
//             this.error = null;
//             try {
//                 const Property = Parse.Object.extend('Property');
//                 const query = new Parse.Query(Property);
//                 // Only fetch properties accessible to the user
//                 const results = await query.find();
//                 this.properties = results;
//             } catch (err) {
//                 this.error = err.message;
//             } finally {
//                 this.loading = false;
//             }
//         }
//     }
// });
