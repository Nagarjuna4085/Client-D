import { getParse } from '@/parseConfig';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false,
        error: null
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
                id: property.id,
                name: property.get('name'),
                code: property.get('code'),
                initialCycleStartDate: property.get('initialCycleStartDate')
                // add more property fields if needed
            };
        }
    },

    actions: {
        async login(username, password) {
            this.loading = true;
            this.error = null;
            try {
                const Parse = await getParse();
                const user = await Parse.User.logIn(username, password);

                const query = new Parse.Query(Parse.User);
                query.include('property');
                const fullUser = await query.get(user.id);

                this.user = fullUser;

                console.log('Logged in user with property:', fullUser.get('property'));
            } catch (err) {
                this.error = err.message;
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

                if (!property) throw new Error('Selected property not found');

                user.set('property', property);

                await user.signUp();
                this.user = user;
                console.log('User signed up successfully', this.user);
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
