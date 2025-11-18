import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "compactNumber",
})
export class CompactNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) {
      return "0";
    }

    const absValue = Math.abs(value);

    if (absValue >= 1000000) {
      const millions = absValue / 1000000;
      return this.formatNumber(millions, "M");
    } else if (absValue >= 1000) {
      const thousands = absValue / 1000;
      return this.formatNumber(thousands, "k");
    }

    return value.toString();
  }

  private formatNumber(num: number, suffix: string): string {
    // If it's a whole number or has one decimal place
    if (num % 1 === 0) {
      return num.toFixed(0) + suffix;
    } else if (num >= 10) {
      // For numbers >= 10, no decimal places (e.g., 13k, not 13.0k)
      return num.toFixed(0) + suffix;
    } else {
      // For numbers < 10, show one decimal place (e.g., 1.5k, 9.8k)
      return num.toFixed(1) + suffix;
    }
  }
}
