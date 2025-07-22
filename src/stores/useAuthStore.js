import { defineStore } from 'pinia';
// import Parse from '../parseConfig'; // adjust path if needed
import { getParse } from '@/parseConfig';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false,
        error: null,
        property: null // <-- add this to hold fetched property data
    }),

    getters: {
        userInfo(state) {
            if (!state.user) return null;
            return {
                id: state.user.id,
                username: state.user.get('username'),
                email: state.user.get('email'),
                createdAt: state.user.createdAt,
                updatedAt: state.user.updatedAt
                // add more user fields if needed
            };
        },

        propertyInfo(state) {
            if (!state.user) return null;
            const property = state.user.get('property');
            if (!property) return null;

            return {
                id: state.property.id,
                name: state.property.get('name'),
                code: state.property.get('code'),
                initialCycleStartDate: property.get('initialCycleStartDate')
                // add more property fields if needed
            };
        }
    },

    actions: {
        async login(username, password) {
            debugger;
            this.loading = true;
            this.error = null;
            try {
                const Parse = await getParse();
                console.log('Parse', Parse);
                const user = await Parse.User.logIn(username, password);
                console.log('user...', user);
                const query = new Parse.Query(Parse.User);
                const fullUser = await query.get(user.id);
                this.user = fullUser;
                // ✅ Fetch property using `pId` (string)
                const pId = fullUser.get('pId');
                if (pId) {
                    const propQuery = new Parse.Query('Property');
                    const property = await propQuery.get(pId);
                    this.property = property;
                    console.log('Fetched property via pId:', property);
                }
                return this.user;
            } catch (err) {
                this.error = err.message;
                console.log('err', err);
            } finally {
                this.loading = false;
            }
        },

        async signup(username, password, propertyCode) {
            this.loading = true;
            this.error = null;
            try {
                const Parse = await getParse();

                const user = new Parse.User();
                user.set('username', username);
                user.set('password', password);

                const query = new Parse.Query('Property');
                query.equalTo('code', propertyCode);
                const property = await query.first();
                console.log('pId', property.Id);

                if (!property) throw new Error('Selected property not found');

                user.set('property', property);
                user.set('pId', property.id);

                await user.signUp();
                this.user = user;
                this.property = property;
                console.log('User signed up successfully', this.user);
                return true;
            } catch (err) {
                this.error = err.message;
                console.error('Signup error:', err);
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            this.loading = true;
            try {
                const Parse = await getParse();
                await Parse.User.logOut();
                this.user = null;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },
        async fetchCurrentUser() {
            const Parse = await getParse();
            this.user = Parse.User.current();
        }
    }
});
