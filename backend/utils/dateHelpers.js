/**
 * Date Helper Utilities
 */

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Format date to display format (e.g., "Jan 15, 2024")
 */
const formatDisplayDate = (date) => {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format date to full display (e.g., "January 15, 2024")
 */
const formatFullDate = (date) => {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format time (e.g., "14:30")
 */
const formatTime = (date) => {
  const d = new Date(date);
  return d.toTimeString().split(' ')[0].substring(0, 5);
};

/**
 * Format datetime (e.g., "2024-01-15 14:30")
 */
const formatDateTime = (date) => {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
};

/**
 * Format datetime to display (e.g., "Jan 15, 2024 14:30")
 */
const formatDisplayDateTime = (date) => {
  const d = new Date(date);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Calculate nights between two dates
 */
const calculateNights = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate - checkInDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Get check-in time (usually 14:00)
 */
const getCheckInTime = () => {
  return process.env.CHECK_IN_TIME || '14:00';
};

/**
 * Get check-out time (usually 11:00)
 */
const getCheckOutTime = () => {
  return process.env.CHECK_OUT_TIME || '11:00';
};

/**
 * Get dates between start and end
 */
const getDatesInRange = (startDate, endDate) => {
  const date = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];

  while (date <= end) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

/**
 * Get days of week from date
 */
const getDayOfWeek = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
};

/**
 * Check if date is weekend
 */
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 5 || day === 6; // Friday or Saturday
};

/**
 * Check if date is today
 */
const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is in the past
 */
const isPast = (date) => {
  const d = new Date(date);
  return d < new Date();
};

/**
 * Check if date is in the future
 */
const isFuture = (date) => {
  const d = new Date(date);
  return d > new Date();
};

/**
 * Add days to date
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Add hours to date
 */
const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

/**
 * Get start of day
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 */
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of week (Monday)
 */
const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Get start of month
 */
const startOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get end of month
 */
const endOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Get age from birthdate
 */
const getAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format duration in minutes to human readable
 */
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
const getRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = d - now;
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  let result;
  if (months > 0) result = `${months} month${months > 1 ? 's' : ''}`;
  else if (weeks > 0) result = `${weeks} week${weeks > 1 ? 's' : ''}`;
  else if (days > 0) result = `${days} day${days > 1 ? 's' : ''}`;
  else if (hours > 0) result = `${hours} hour${hours > 1 ? 's' : ''}`;
  else if (minutes > 0) result = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  else result = 'just now';

  return diff > 0 ? `in ${result}` : `${result} ago`;
};

/**
 * Parse date string with multiple format support
 */
const parseDate = (dateStr) => {
  if (dateStr instanceof Date) return dateStr;
  
  // Try ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date)) return date;

  // Try other common formats
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/ // DD-MM-YYYY
  ];

  for (const format of formats) {
    if (format.test(dateStr)) {
      const parts = dateStr.split(/[-\/]/);
      if (format.toString().includes('YYYY')) {
        date = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        date = new Date(parts[2], parts[0] - 1, parts[1]);
      }
      if (!isNaN(date)) return date;
    }
  }

  return null;
};

/**
 * Check if two date ranges overlap
 */
const rangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Get timezone offset in hours
 */
const getTimezoneOffset = (timezone = 'Africa/Nairobi') => {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate - utcDate) / (1000 * 60 * 60);
};

module.exports = {
  formatDate,
  formatDisplayDate,
  formatFullDate,
  formatTime,
  formatDateTime,
  formatDisplayDateTime,
  calculateNights,
  getCheckInTime,
  getCheckOutTime,
  getDatesInRange,
  getDayOfWeek,
  isWeekend,
  isToday,
  isPast,
  isFuture,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  getAge,
  formatDuration,
  getRelativeTime,
  parseDate,
  rangesOverlap,
  getTimezoneOffset
};
