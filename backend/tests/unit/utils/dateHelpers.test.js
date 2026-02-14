const {
  formatDate,
  formatTime,
  calculateNights,
  isDateInRange,
  addDays,
  subtractDays,
  getDateRange,
  isValidDate,
  parseDate,
  getDaysInMonth,
  isWeekend,
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  isSameDay,
  isPastDate,
  isFutureDate,
  getTimezoneOffset
} = require('../../../utils/dateHelpers');

describe('Date Helpers Unit Tests', () => {
  describe('formatDate', () => {
    it('should format date with default format (YYYY-MM-DD)', () => {
      const date = new Date('2024-06-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024-06-15');
    });

    it('should format date with custom format', () => {
      const date = new Date('2024-06-15T10:30:00Z');
      const result = formatDate(date, 'DD/MM/YYYY');
      expect(result).toBe('15/06/2024');
    });

    it('should handle string date input', () => {
      const result = formatDate('2024-06-15', 'MMMM DD, YYYY');
      expect(result).toContain('June');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatTime', () => {
    it('should format time with default 24-hour format', () => {
      const date = new Date('2024-06-15T14:30:00Z');
      const result = formatTime(date);
      expect(result).toBe('14:30');
    });

    it('should format time with 12-hour format', () => {
      const date = new Date('2024-06-15T14:30:00Z');
      const result = formatTime(date, true);
      expect(result).toContain('30');
    });

    it('should handle string time input', () => {
      const result = formatTime('14:30:00');
      expect(result).toBe('14:30');
    });
  });

  describe('calculateNights', () => {
    it('should calculate correct number of nights', () => {
      const checkIn = new Date('2024-06-01');
      const checkOut = new Date('2024-06-05');
      
      const nights = calculateNights(checkIn, checkOut);
      expect(nights).toBe(4);
    });

    it('should return 0 for same day check-in/out', () => {
      const date = new Date('2024-06-01');
      
      const nights = calculateNights(date, date);
      expect(nights).toBe(0);
    });

    it('should handle string date inputs', () => {
      const nights = calculateNights('2024-06-01', '2024-06-03');
      expect(nights).toBe(2);
    });

    it('should return negative for invalid dates', () => {
      const nights = calculateNights('invalid', '2024-06-03');
      expect(nights).toBeLessThan(0);
    });
  });

  describe('isDateInRange', () => {
    it('should return true when date is in range', () => {
      const date = new Date('2024-06-15');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');
      
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return true when date equals start', () => {
      const date = new Date('2024-06-01');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');
      
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return true when date equals end', () => {
      const date = new Date('2024-06-30');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');
      
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return false when date is before range', () => {
      const date = new Date('2024-05-15');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');
      
      expect(isDateInRange(date, start, end)).toBe(false);
    });

    it('should return false when date is after range', () => {
      const date = new Date('2024-07-15');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');
      
      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add specified number of days', () => {
      const date = new Date('2024-06-15');
      const result = addDays(date, 5);
      
      expect(result.getDate()).toBe(20);
    });

    it('should handle adding negative days (subtract)', () => {
      const date = new Date('2024-06-15');
      const result = addDays(date, -5);
      
      expect(result.getDate()).toBe(10);
    });

    it('should handle string date input', () => {
      const result = addDays('2024-06-15', 10);
      expect(result.getDate()).toBe(25);
    });
  });

  describe('subtractDays', () => {
    it('should subtract specified number of days', () => {
      const date = new Date('2024-06-15');
      const result = subtractDays(date, 5);
      
      expect(result.getDate()).toBe(10);
    });
  });

  describe('getDateRange', () => {
    it('should return array of dates in range', () => {
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-05');
      
      const range = getDateRange(start, end);
      
      expect(range).toHaveLength(5);
      expect(range[0].getDate()).toBe(1);
      expect(range[4].getDate()).toBe(5);
    });

    it('should return single date for same start/end', () => {
      const date = new Date('2024-06-15');
      const range = getDateRange(date, date);
      
      expect(range).toHaveLength(1);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date', () => {
      expect(isValidDate('2024-06-15')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
    });

    it('should return false for invalid date', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2024-13-45')).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2024-06-15'); // A Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2024-06-16'); // A Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekday', () => {
      const monday = new Date('2024-06-17'); // A Monday
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(isPastDate(futureDate)).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isFutureDate(pastDate)).toBe(false);
    });
  });
});
