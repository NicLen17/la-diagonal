export const VENUE_TIMEZONE = "America/Argentina/Tucuman";
export function venueDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VENUE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function venueTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VENUE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
export function venueDateTime(day: string, time: string) {
  return new Date(`${day}T${time}:00-03:00`);
}
export function venueDayRange(date: Date) {
  const start = venueDateTime(venueDateKey(date), "00:00");
  return { start, end: new Date(start.getTime() + 86400000) };
}
