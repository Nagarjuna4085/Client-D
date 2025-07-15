// import { Parse } from '@/parse'; // ✅ named import
// import { defineStore } from 'pinia';
// // import { useRouter } from 'vue-router';

// export const useAuthStore = defineStore('auth', {
//     state: () => ({
//         user: null,
//         loading: false,
//         error: null
//     }),

//     actions: {
//         async login(username, password) {
//             this.loading = true;
//             this.error = null;
//             try {
//                 const user = await Parse.User.logIn(username, password);
//                 this.user = user;

//                 // ✅ Call router inside the action
//                 // const router = useRouter();
//                 // router.push('/');
//             } catch (err) {
//                 this.error = err.message;
//             } finally {
//                 this.loading = false;
//             }
//         },

//         async signup(username, password, propertyId) {
//             this.loading = true;
//             this.error = null;
//             try {
//                 const user = new Parse.User();
//                 user.set('username', username);
//                 user.set('password', password);

//                 const Property = Parse.Object.extend('Property');
//                 const property = new Property();
//                 property.id = propertyId;
//                 user.set('property', property);

//                 await user.signUp();
//                 this.user = user;

//                 // Redirect after signup
//                 // const router = useRouter();
//                 // router.push('/');
//             } catch (err) {
//                 this.error = err.message;
//             } finally {
//                 this.loading = false;
//             }
//         },

//         async logout() {
//             await Parse.User.logOut();
//             this.user = null;
//         },

//         fetchCurrentUser() {
//             this.user = Parse.User.current();
//         }
//     }
// });
