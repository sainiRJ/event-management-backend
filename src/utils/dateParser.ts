import * as chrono from 'chrono-node';

export function parseUserDate(rawDate: string): Date | null {
  if (!rawDate) return null;

  const now = new Date();
  const parsed = chrono.parse(rawDate, now, { forwardDate: true });
  console.log("parsed", parsed)

  if (!parsed || parsed.length === 0) return null;

  const date = parsed[0].start?.date();
  console.log("date ", date)
  if (!date) return null;

  // Handle cases where user does not specify year
  const userYear = parsed[0].start.get('year');
  console.log("userYear ", userYear)

  const currentYear = now.getFullYear();
  console.log("currentYear ", currentYear)


  if (!userYear) {
    const futureDate = new Date(date);
  console.log("futureDate ", futureDate)

    futureDate.setFullYear(
      date.getMonth() < now.getMonth() ||
      (date.getMonth() === now.getMonth() && date.getDate() < now.getDate())
        ? currentYear + 1
        : currentYear
    );
    return futureDate;
  }

  return date;
}
