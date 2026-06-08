import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isBetween);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.extend(utc);

export default dayjs;

export function getDate(date?: string | Date | Dayjs | null, locale: string = 'en') {
  return date ? dayjs(date).locale(locale).format('DD-MMM-YYYY') : '-';
}

export function getDateString(date?: string | Date | Dayjs | null, locale: string = 'en') {
  return date ? dayjs(date).locale(locale).format('DD-MMM-YYYY hh:mm A') : '-';
}
