const MS_IN_DAY = 86400000;

function getLocalDate(year, month, day) {
    return new Date(year, month - 1, day); // JS months = 0-based
}

// This is your starting cycle — configure only once
const initialCycleStartDate = getLocalDate(2025, 7, 14);

function getCurrentCycle(today = new Date()) {
    const diffDays = Math.floor((today - initialCycleStartDate) / MS_IN_DAY);
    const currentCycleIndex = Math.floor(diffDays / 14);
    const start = new Date(initialCycleStartDate.getTime() + currentCycleIndex * 14 * MS_IN_DAY);
    const end = new Date(start.getTime() + 13 * MS_IN_DAY); // 14-day period

    return { start, end };
}

function getNextCycle(currentCycle) {
    const start = new Date(currentCycle.start.getTime() + 14 * MS_IN_DAY);
    const end = new Date(start.getTime() + 13 * MS_IN_DAY);
    return { start, end };
}

function getPreviousCycle(currentCycle) {
    const start = new Date(currentCycle.start.getTime() - 14 * MS_IN_DAY);
    const end = new Date(start.getTime() + 13 * MS_IN_DAY);
    return { start, end };
}

// function formatDate(date) {
//     return date.toLocaleDateString('en-CA'); // gives 'YYYY-MM-DD'
// }
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // local midnight
}

// store in db like this
function parseLocalDateFromUTC(date) {
    // date is a Date object (UTC)
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export { getCurrentCycle, getNextCycle, getPreviousCycle, initialCycleStartDate, parseLocalDate, parseLocalDateFromUTC };
