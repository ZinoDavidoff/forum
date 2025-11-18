import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "timeAgo",
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return "";

    const now = new Date();
    const past = new Date(value);
    const secondsAgo = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (secondsAgo < 0) return "just now";

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    if (secondsAgo < 10) {
      return "just now";
    }

    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    }

    if (secondsAgo < intervals.hour) {
      const minutes = Math.floor(secondsAgo / intervals.minute);
      return `${minutes}m ago`;
    }

    if (secondsAgo < intervals.day) {
      const hours = Math.floor(secondsAgo / intervals.hour);
      return `${hours}h ago`;
    }

    if (secondsAgo < intervals.week) {
      const days = Math.floor(secondsAgo / intervals.day);
      return `${days}d ago`;
    }

    if (secondsAgo < intervals.month) {
      const weeks = Math.floor(secondsAgo / intervals.week);
      return `${weeks}w ago`;
    }

    if (secondsAgo < intervals.year) {
      const months = Math.floor(secondsAgo / intervals.month);
      return `${months}mo ago`;
    }

    const years = Math.floor(secondsAgo / intervals.year);
    return `${years}y ago`;
  }
}
