export class DateManipulator {
  static datediff(first: number, second: number) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  }

  static daysLeft(baseDate: number, translation: any) {
    //get days left based on today
    var left = this.datediff(baseDate, new Date().getTime());
    if (left < 0) {
      return -left + ' ' + (translation ? translation.TO_END : 'TO_END');
    } else {
      return left + ' ' + (translation ? translation.DELAYED : 'DELAYED');
    }
  }
}
