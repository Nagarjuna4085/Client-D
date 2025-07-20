let ParseInstance = null;

export async function getParse() {
    if (!ParseInstance) {
        // Dynamically import the UMD bundle directly (works in browser environment)
        const ParseModule = await import('parse/dist/parse.min.js');

        // In UMD, Parse is exposed as default export or directly on the module
        const Parse = ParseModule.default || ParseModule;

        if (!Parse || typeof Parse.initialize !== 'function') {
            throw new Error('Parse module did not load correctly');
        }
        // Use Vite environment variables
        const appId = import.meta.env.VITE_PARSE_APP_ID;
        const jsKey = import.meta.env.VITE_PARSE_JS_KEY;
        const serverUrl = import.meta.env.VITE_PARSE_SERVER_URL;
        console.log(appId, jsKey, serverUrl);

        // Parse.initialize('kokUdaUTVuQUSluDNbprmM7ZtS9YE98pQb6ZedVG', 'z9LxYMEBTMPj0yzhIthcXPb8YGyeJL6hW7BvTkuL');
        // Parse.serverURL = 'https://parseapi.back4app.com';
        Parse.initialize(appId, jsKey);
        Parse.serverURL = serverUrl;

        ParseInstance = Parse;
    }
    return ParseInstance;
}
