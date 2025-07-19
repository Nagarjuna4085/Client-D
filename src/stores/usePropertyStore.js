import { getParse } from '@/parseConfig';
import { defineStore } from 'pinia';

export const usePropertyStore = defineStore('property', {
    state: () => ({
        properties: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchProperties() {
            this.loading = true;
            this.error = null;
            try {
                const Parse = await getParse();
                const Property = Parse.Object.extend('Property');
                const query = new Parse.Query(Property);
                // Only fetch properties accessible to the user
                const results = await query.find();
                // results.forEach((property) => {
                //     console.log('ID:', property.id);
                //     console.log('Name:', property.get('name'));
                //     // console.log('Location:', property.get('location'));
                //     console.log('Owner:', property.get('createdBy')?.id);
                // });
                //
                this.properties = results;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        }
    }
});
