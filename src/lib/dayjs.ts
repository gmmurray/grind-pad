import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function fromDate(date: string): string {
  return dayjs().from(dayjs(date));
}

export function toDate(date: string): string {
  return dayjs().to(dayjs(date));
}
