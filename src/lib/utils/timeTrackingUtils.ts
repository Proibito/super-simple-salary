import { differenceInMinutes, getMonth, setHours, setMinutes } from 'date-fns'
import type { DetailedWage, TimeSlot, WorkedDay } from '../../types'

/**
 * Calculates the total number of hours worked in a day.
 * @param timeSlots - Array of time slots worked in a day.
 * @returns Total hours worked in a day.
 */
export function calculateTotalHours(timeSlots: TimeSlot[]): number {
  let total = 0
  timeSlots.forEach((slot) => {
    total += calculateSingleSlotHours(slot) / 60
  })
  return total
}

/**
 * Calculates the number of minutes worked in a single time slot.
 * @param slot - A time slot containing start and end time.
 * @returns Number of minutes worked in the time slot.
 */
function calculateSingleSlotHours(slot: TimeSlot): number {
  const [startHour, startMinute] = slot.start.split(':').map(Number)
  const [endHour, endMinute] = slot.end.split(':').map(Number)

  let startTime = new Date()
  startTime = setHours(startTime, startHour)
  startTime = setMinutes(startTime, startMinute)

  let endTime = new Date()
  endTime = setHours(endTime, endHour)
  endTime = setMinutes(endTime, endMinute)

  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1)
  }

  return differenceInMinutes(endTime, startTime)
}

/**
 * Calculates the total hours worked in a specific month.
 * @param days - Array of worked days.
 * @param month - The month to calculate hours for (0-based index, 0 for January, 11 for December).
 * @returns Total hours worked in the specified month.
 */
export function getHoursOfMonth(days: WorkedDay[], month: number): number {
  let total: number = 0
  days.forEach((day) => {
    if (getMonth(day.date) == month) {
      total += calculateTotalHours(day.timeSlots)
    }
  })
  return total
}

/**
 * Counts the number of days worked in a specific month.
 * @param days - Array of worked days.
 * @param month - The month to count days for (0-based index, 0 for January, 11 for December).
 * @returns Number of days worked in the specified month.
 */
export function getDaysWorkedInMonth(days: WorkedDay[], month: number): number {
  let total: number = 0
  days.forEach((day) => {
    if (getMonth(day.date) == month) {
      total += 1
    }
  })
  return total
}

/**
 * Counts the number of days with travel in a specific month.
 * @param days - Array of worked days.
 * @param month - The month to count days for (0-based index, 0 for January, 11 for December).
 * @returns Number of days with travel in the specified month.
 */
export function getDaysWithTravel(days: WorkedDay[], month: number): number {
  let total: number = 0
  days.forEach((day) => {
    if (getMonth(day.date) == month && day.travel) {
      total += 1
    }
  })
  return total
}

/**
 * Calculates the total compensation based on worked days.
 * @param days - Array of worked days.
 * @returns Total compensation.
 */
export function calculateTotalCompensation(days: WorkedDay[]): number {
  let totalWorked = 0
  let travelTotal = 0
  let carAllowance = 0
  for (const day of days) {
    travelTotal += day.travel ? 2 : 0
    totalWorked += calculateTotalHours(day.timeSlots)
    carAllowance += day.carUsage ? 40 : 0
  }

  return (totalWorked + travelTotal) * 10 + carAllowance
}

/**
 * Calculates detailed compensation breakdown based on worked days.
 * @param days - Array of worked days.
 * @returns Object containing total hours, total travel, and daily allowance.
 */
export function calculateDetailedCompensation(days: WorkedDay[]): DetailedWage {
  let totalWorked = 0
  let travelTotal = 0
  let carAllowance = 0
  for (const day of days) {
    travelTotal += day.travel ? 2 : 0
    totalWorked += calculateTotalHours(day.timeSlots)
    carAllowance += day.carUsage ? 1 : 0
  }

  return {
    totalHours: totalWorked,
    totalTravel: travelTotal,
    dailyAllowance: carAllowance
  }
}

/**
 * Counts the number of days using your car in a specific month.
 * @param days - Array of worked days.
 * @param month - The month to count days for (0-based index, 0 for January, 11 for December).
 * @returns Number of days using your car in the specified month.
 */
export function calculateCarUsage(days: WorkedDay[], month: number): number {
  let total: number = 0
  days.forEach((day) => {
    if (getMonth(day.date) == month && day.carUsage) {
      total += 1
    }
  })
  return total
}

/**
 * Calculates the earnings for a specific worked day.
 * @param day - A worked day.
 * @returns Earnings for the specified day.
 */
export function calculateDailyEarnings(day: WorkedDay): number {
  return (
    calculateTotalHours(day.timeSlots) * 10 +
    (day.travel ? 2 * 10 : 0) +
    (day.carUsage ? 40 : 0)
  )
}
