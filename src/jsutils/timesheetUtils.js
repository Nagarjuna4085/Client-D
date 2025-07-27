const MS_IN_DAY = 24 * 60 * 60 * 1000;
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

// Helper: Convert "YYYY-MM-DD" to local date
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Helper: Convert UTC Date object to local date (midnight)
function parseLocalDateFromUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
// Default to today's local date
let initialCycleStartDate = new Date();
// Get the local cycle start date if present in propertyInfo
const rawStart = authStore.propertyInfo?.initialCycleStartDate;
if (rawStart) {
    const parsedStart = parseLocalDateFromUTC(new Date(rawStart));
    const cycle = getCurrentCycle(parsedStart);
    initialCycleStartDate = cycle.start;
}

// Returns the current cycle range based on today or a given date
function getCurrentCycle(today = new Date()) {
    const diffDays = Math.floor((today - initialCycleStartDate) / MS_IN_DAY);
    const currentCycleIndex = Math.floor(diffDays / 14);
    const start = new Date(initialCycleStartDate.getTime() + currentCycleIndex * 14 * MS_IN_DAY);
    const end = new Date(start.getTime() + 13 * MS_IN_DAY);
    return { start, end };
}

// Move to next 14-day cycle
function getNextCycle(currentCycle) {
    const start = new Date(currentCycle.start.getTime() + 14 * MS_IN_DAY);
    const end = new Date(start.getTime() + 13 * MS_IN_DAY);
    return { start, end };
}

// Move to previous 14-day cycle
function getPreviousCycle(currentCycle) {
    const start = new Date(currentCycle.start.getTime() - 14 * MS_IN_DAY);
    const end = new Date(start.getTime() + 13 * MS_IN_DAY);
    return { start, end };
}

/**
 * Get the cycle (14-day period) where a given date falls.
 * @param {Date} inputDate - The date you want to check.
 * @param {Date} rawStartDate - The original start date of the first cycle (e.g., July 14, 2025).
 * @returns {{ start: Date, end: Date }}
 */
function getCycleForDate(inputDate, rawStartDate) {
    debugger;
    console.log(inputDate, rawStartDate);
    // Make sure both dates are at 00:00:00 time to avoid time issues
    const startDate = new Date(rawStartDate);
    startDate.setHours(0, 0, 0, 0);

    const date = new Date(inputDate);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((date - startDate) / MS_IN_DAY);
    const cycleIndex = Math.floor(diffDays / 14);

    const cycleStart = new Date(startDate.getTime() + cycleIndex * 14 * MS_IN_DAY);
    const cycleEnd = new Date(cycleStart.getTime() + 13 * MS_IN_DAY);

    return {
        start: cycleStart,
        end: cycleEnd
    };
}
function calculateTotalSalary(grandTotal, payRate) {
    debugger;
    const [hoursStr, minutesStr] = grandTotal.split(':');
    console.log(hoursStr, minutesStr);
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const totalHours = hours + minutes / 60;

    const salary = totalHours * payRate;
    return Number(salary.toFixed(2)); // Convert to number with 2 decimal points
}

export { calculateTotalSalary, getCurrentCycle, getCycleForDate, getNextCycle, getPreviousCycle, initialCycleStartDate, parseLocalDate, parseLocalDateFromUTC };
