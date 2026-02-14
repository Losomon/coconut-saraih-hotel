/**
 * Report Queue
 * Bull queue for processing report generation jobs
 */

const Queue = require('bull');
const config = require('../config');
const pdfService = require('../utils/pdf');
const logger = require('../utils/logger');
const { addEmailJob } = require('./emailQueue');

// Create report queue
const reportQueue = new Queue('report-queue', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db || 0
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 50,
    removeOnFail: 100
  }
});

// Report job types
const REPORT_JOB_TYPES = {
  DAILY_SALES: 'daily_sales',
  WEEKLY_SALES: 'weekly_sales',
  MONTHLY_SALES: 'monthly_sales',
  ANNUAL_SALES: 'annual_sales',
  OCCUPANCY_REPORT: 'occupancy_report',
  REVENUE_REPORT: 'revenue_report',
  GUEST_REPORT: 'guest_report',
  BOOKING_REPORT: 'booking_report',
  FINANCIAL_REPORT: 'financial_report',
  CUSTOM_REPORT: 'custom_report'
};

/**
 * Process report generation jobs
 */
reportQueue.process(async (job) => {
  const { type, params, options } = job.data;

  logger.info(`Processing report job: ${job.id}, type: ${type}`);

  try {
    let reportData = null;
    let filename = '';

    switch (type) {
      case REPORT_JOB_TYPES.DAILY_SALES:
        reportData = await generateDailySalesReport(params);
        filename = `daily-sales-${params.date}.pdf`;
        break;

      case REPORT_JOB_TYPES.WEEKLY_SALES:
        reportData = await generateWeeklySalesReport(params);
        filename = `weekly-sales-${params.startDate}-${params.endDate}.pdf`;
        break;

      case REPORT_JOB_TYPES.MONTHLY_SALES:
        reportData = await generateMonthlySalesReport(params);
        filename = `monthly-sales-${params.year}-${params.month}.pdf`;
        break;

      case REPORT_JOB_TYPES.ANNUAL_SALES:
        reportData = await generateAnnualSalesReport(params);
        filename = `annual-sales-${params.year}.pdf`;
        break;

      case REPORT_JOB_TYPES.OCCUPANCY_REPORT:
        reportData = await generateOccupancyReport(params);
        filename = `occupancy-report-${params.startDate}-${params.endDate}.pdf`;
        break;

      case REPORT_JOB_TYPES.REVENUE_REPORT:
        reportData = await generateRevenueReport(params);
        filename = `revenue-report-${params.startDate}-${params.endDate}.pdf`;
        break;

      case REPORT_JOB_TYPES.GUEST_REPORT:
        reportData = await generateGuestReport(params);
        filename = `guest-report-${params.guestId}.pdf`;
        break;

      case REPORT_JOB_TYPES.BOOKING_REPORT:
        reportData = await generateBookingReport(params);
        filename = `booking-report-${params.startDate}-${params.endDate}.pdf`;
        break;

      case REPORT_JOB_TYPES.FINANCIAL_REPORT:
        reportData = await generateFinancialReport(params);
        filename = `financial-report-${params.startDate}-${params.endDate}.pdf`;
        break;

      case REPORT_JOB_TYPES.CUSTOM_REPORT:
        reportData = await generateCustomReport(params);
        filename = `custom-report-${Date.now()}.pdf`;
        break;

      default:
        logger.warn(`Unknown report job type: ${type}`);
        throw new Error(`Unknown report job type: ${type}`);
    }

    // Store or send report
    if (options.sendEmail && options.email) {
      await sendReportViaEmail(options.email, reportData, filename, type);
    }

    if (options.store) {
      await storeReport(reportData, type, params);
    }

    logger.info(`Report job completed: ${job.id}`);
    return { success: true, filename };

  } catch (error) {
    logger.error(`Report job failed: ${job.id}`, error);
    throw error;
  }
});

/**
 * Generate daily sales report
 */
const generateDailySalesReport = async (params) => {
  const { date } = params;
  const Booking = require('../models/Booking');
  const Payment = require('../models/Payment');

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get bookings for the day
  const bookings = await Booking.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).lean();

  // Get payments for the day
  const payments = await Payment.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    status: 'completed'
  }).lean();

  // Calculate metrics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const roomRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const checkIns = bookings.filter(b => b.status === 'checked-in').length;
  const checkOuts = bookings.filter(b => b.status === 'checked-out').length;

  // Generate PDF
  const pdfBuffer = await pdfService.generateDailySalesReportPDF(
    {
      totalRevenue,
      roomRevenue,
      fbRevenue: totalRevenue * 0.2, // Placeholder
      activityRevenue: totalRevenue * 0.1,
      spaRevenue: totalRevenue * 0.05,
      totalBookings,
      checkIns,
      checkOuts,
      occupancyRate: 75, // Placeholder
      topRooms: []
    },
    date
  );

  return {
    type: REPORT_JOB_TYPES.DAILY_SALES,
    date,
    generatedAt: new Date(),
    metrics: {
      totalRevenue,
      roomRevenue,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      checkIns,
      checkOuts
    },
    pdf: pdfBuffer
  };
};

/**
 * Generate weekly sales report
 */
const generateWeeklySalesReport = async (params) => {
  const { startDate, endDate } = params;
  
  // Similar to daily but aggregated for a week
  const start = new Date(startDate);
  const end = new Date(endDate);

  const Booking = require('../models/Booking');
  const Payment = require('../models/Payment');

  const [bookings, payments] = await Promise.all([
    Booking.find({
      createdAt: { $gte: start, $lte: end }
    }).lean(),
    Payment.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).lean()
  ]);

  // Group by day
  const dailyData = {};
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayKey = d.toISOString().split('T')[0];
    dailyData[dayKey] = {
      date: dayKey,
      revenue: 0,
      bookings: 0,
      checkIns: 0,
      checkOuts: 0
    };
  }

  payments.forEach(p => {
    const dayKey = new Date(p.createdAt).toISOString().split('T')[0];
    if (dailyData[dayKey]) {
      dailyData[dayKey].revenue += p.amount;
    }
  });

  bookings.forEach(b => {
    const dayKey = new Date(b.createdAt).toISOString().split('T')[0];
    if (dailyData[dayKey]) {
      dailyData[dayKey].bookings++;
      if (b.status === 'checked-in') dailyData[dayKey].checkIns++;
      if (b.status === 'checked-out') dailyData[dayKey].checkOuts++;
    }
  });

  return {
    type: REPORT_JOB_TYPES.WEEKLY_SALES,
    startDate,
    endDate,
    generatedAt: new Date(),
    dailyData: Object.values(dailyData),
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    totalBookings: bookings.length,
    pdf: null // Generate on demand
  };
};

/**
 * Generate monthly sales report
 */
const generateMonthlySalesReport = async (params) => {
  const { year, month } = params;
  
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const Booking = require('../models/Booking');
  const Payment = require('../models/Payment');

  const [bookings, payments] = await Promise.all([
    Booking.find({
      createdAt: { $gte: start, $lte: end }
    }).lean(),
    Payment.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).lean()
  ]);

  // Group by week
  const weeklyData = [];
  let currentWeekStart = new Date(start);
  
  while (currentWeekStart < end) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekPayments = payments.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate >= currentWeekStart && pDate <= weekEnd;
    });
    
    const weekBookings = bookings.filter(b => {
      const bDate = new Date(b.createdAt);
      return bDate >= currentWeekStart && bDate <= weekEnd;
    });

    weeklyData.push({
      weekStart: currentWeekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      revenue: weekPayments.reduce((sum, p) => sum + p.amount, 0),
      bookings: weekBookings.length
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return {
    type: REPORT_JOB_TYPES.MONTHLY_SALES,
    year,
    month,
    generatedAt: new Date(),
    weeklyData,
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    totalBookings: bookings.length,
    pdf: null
  };
};

/**
 * Generate annual sales report
 */
const generateAnnualSalesReport = async (params) => {
  const { year } = params;
  
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const Booking = require('../models/Booking');
  const Payment = require('../models/Payment');

  const [bookings, payments] = await Promise.all([
    Booking.find({
      createdAt: { $gte: start, $lte: end }
    }).lean(),
    Payment.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).lean()
  ]);

  // Group by month
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
    revenue: 0,
    bookings: 0,
    roomsSold: 0
  }));

  payments.forEach(p => {
    const month = new Date(p.createdAt).getMonth();
    monthlyData[month].revenue += p.amount;
  });

  bookings.forEach(b => {
    const month = new Date(b.createdAt).getMonth();
    monthlyData[month].bookings++;
  });

  return {
    type: REPORT_JOB_TYPES.ANNUAL_SALES,
    year,
    generatedAt: new Date(),
    monthlyData,
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    totalBookings: bookings.length,
    pdf: null
  };
};

/**
 * Generate occupancy report
 */
const generateOccupancyReport = async (params) => {
  const { startDate, endDate } = params;
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  const Booking = require('../models/Booking');
  const Room = require('../models/Room');

  const [bookings, rooms] = await Promise.all([
    Booking.find({
      $or: [
        { checkIn: { $gte: start, $lte: end } },
        { checkOut: { $gte: start, $lte: end } }
      ],
      status: { $nin: ['cancelled', 'no-show'] }
    }).lean(),
    Room.find().lean()
  ]);

  const roomTypes = {};
  rooms.forEach(room => {
    const type = room.roomType;
    if (!roomTypes[type]) {
      roomTypes[type] = {
        type,
        totalRooms: 0,
        occupiedNights: 0,
        availableNights: 0
      };
    }
    roomTypes[type].totalRooms++;
  });

  const totalNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  bookings.forEach(booking => {
    const type = booking.roomType;
    if (roomTypes[type]) {
      roomTypes[type].occupiedNights += booking.numberOfNights || 1;
    }
  });

  Object.values(roomTypes).forEach(rt => {
    rt.availableNights = rt.totalRooms * totalNights;
    rt.occupancyRate = (rt.occupiedNights / rt.availableNights * 100).toFixed(2);
  });

  return {
    type: REPORT_JOB_TYPES.OCCUPANCY_REPORT,
    startDate,
    endDate,
    generatedAt: new Date(),
    roomTypes: Object.values(roomTypes),
    totalRooms: rooms.length,
    pdf: null
  };
};

/**
 * Generate revenue report
 */
const generateRevenueReport = async (params) => {
  const { startDate, endDate } = params;
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  const Payment = require('../models/Payment');

  const payments = await Payment.find({
    createdAt: { $gte: start, $lte: end },
    status: 'completed'
  }).lean();

  // Group by payment method
  const byMethod = {};
  payments.forEach(p => {
    const method = p.paymentMethod || 'unknown';
    if (!byMethod[method]) {
      byMethod[method] = { method, count: 0, amount: 0 };
    }
    byMethod[method].count++;
    byMethod[method].amount += p.amount;
  });

  // Group by day
  const byDay = {};
  payments.forEach(p => {
    const day = new Date(p.createdAt).toISOString().split('T')[0];
    if (!byDay[day]) {
      byDay[day] = { date: day, count: 0, amount: 0 };
    }
    byDay[day].count++;
    byDay[day].amount += p.amount;
  });

  return {
    type: REPORT_JOB_TYPES.REVENUE_REPORT,
    startDate,
    endDate,
    generatedAt: new Date(),
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    byMethod: Object.values(byMethod),
    byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
    pdf: null
  };
};

/**
 * Generate guest report
 */
const generateGuestReport = async (params) => {
  const { guestId } = params;
  
  const Guest = require('../models/Guest');
  const Booking = require('../models/Booking');

  const [guest, bookings] = await Promise.all([
    Guest.findById(guestId).lean(),
    Booking.find({ guestId }).lean()
  ]);

  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const avgNightlyRate = bookings.length > 0 
    ? totalSpent / bookings.reduce((sum, b) => sum + (b.numberOfNights || 1), 0)
    : 0;

  // Generate PDF
  const pdfBuffer = await pdfService.generateGuestReportPDF(guest, bookings, {
    totalBookings: bookings.length,
    totalNights: bookings.reduce((sum, b) => sum + (b.numberOfNights || 1), 0),
    totalSpent,
    avgNightlyRate,
    lastStay: bookings[0]?.checkIn
  });

  return {
    type: REPORT_JOB_TYPES.GUEST_REPORT,
    guestId,
    generatedAt: new Date(),
    guest: {
      name: `${guest?.firstName} ${guest?.lastName}`,
      email: guest?.email,
      phone: guest?.phone
    },
    stats: {
      totalBookings: bookings.length,
      totalSpent,
      avgNightlyRate
    },
    recentBookings: bookings.slice(0, 10),
    pdf: pdfBuffer
  };
};

/**
 * Generate booking report
 */
const generateBookingReport = async (params) => {
  const { startDate, endDate, filters } = params;
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  const query = {
    createdAt: { $gte: start, $lte: end }
  };

  if (filters?.status) {
    query.status = filters.status;
  }
  if (filters?.roomType) {
    query.roomType = filters.roomType;
  }

  const Booking = require('../models/Booking');
  const bookings = await Booking.find(query).lean();

  const byStatus = {};
  bookings.forEach(b => {
    if (!byStatus[b.status]) {
      byStatus[b.status] = { status: b.status, count: 0, revenue: 0 };
    }
    byStatus[b.status].count++;
    byStatus[b.status].revenue += b.totalAmount || 0;
  });

  return {
    type: REPORT_JOB_TYPES.BOOKING_REPORT,
    startDate,
    endDate,
    generatedAt: new Date(),
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    byStatus: Object.values(byStatus),
    bookings: bookings.slice(0, 100), // Limit for PDF
    pdf: null
  };
};

/**
 * Generate financial report
 */
const generateFinancialReport = async (params) => {
  const { startDate, endDate } = params;
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  const Payment = require('../models/Payment');
  const Booking = require('../models/Booking');

  const [payments, bookings, refunds] = await Promise.all([
    Payment.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).lean(),
    Booking.find({
      createdAt: { $gte: start, $lte: end }
    }).lean(),
    Payment.find({
      createdAt: { $gte: start, $lte: end },
      type: 'refund'
    }).lean()
  ]);

  const grossRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunds = refunds.reduce((sum, p) => sum + p.amount, 0);
  const netRevenue = grossRevenue - totalRefunds;

  // Calculate taxes, fees, etc.
  const taxCollected = netRevenue * 0.16; // VAT
  const netAfterTax = netRevenue - taxCollected;

  return {
    type: REPORT_JOB_TYPES.FINANCIAL_REPORT,
    startDate,
    endDate,
    generatedAt: new Date(),
    summary: {
      grossRevenue,
      totalRefunds,
      netRevenue,
      taxCollected,
      netAfterTax
    },
    transactionCount: payments.length,
    pdf: null
  };
};

/**
 * Generate custom report
 */
const generateCustomReport = async (params) => {
  const { title, sections, dateRange } = params;

  // Custom report generation logic
  return {
    type: REPORT_JOB_TYPES.CUSTOM_REPORT,
    title,
    sections,
    dateRange,
    generatedAt: new Date(),
    pdf: null
  };
};

/**
 * Send report via email
 */
const sendReportViaEmail = async (email, reportData, filename, reportType) => {
  const { sendCustomEmail } = require('./emailQueue');

  const subject = `Your ${reportType.replace(/_/g, ' ')} Report`;
  const html = `
    <h2>Your Report is Ready</h2>
    <p>Your ${reportData.type} report has been generated.</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    ${reportData.metrics ? `
      <h3>Summary</h3>
      <ul>
        ${Object.entries(reportData.metrics).map(([key, value]) => 
          `<li>${key}: ${typeof value === 'number' ? value.toFixed(2) : value}</li>`
        ).join('')}
      </ul>
    ` : ''}
    <p>You can download the full report from your dashboard.</p>
  `;

  // Note: Would attach PDF in production
  await sendCustomEmail(email, subject, html);
};

/**
 * Store report
 */
const storeReport = async (reportData, type, params) => {
  // Would store in database or cloud storage (S3)
  logger.info(`Report stored: ${type}`, params);
};

/**
 * Add report job to queue
 */
const addReportJob = async (type, params, options = {}) => {
  const job = await reportQueue.add(
    { type, params, options },
    {
      priority: options.priority || 2,
      ...options
    }
  );

  logger.info(`Report job added: ${job.id}, type: ${type}`);
  return job;
};

/**
 * Schedule daily sales report
 */
const scheduleDailySalesReport = async (date) => {
  return addReportJob(REPORT_JOB_TYPES.DAILY_SALES, { date });
};

/**
 * Schedule weekly sales report
 */
const scheduleWeeklySalesReport = async (startDate, endDate) => {
  return addReportJob(REPORT_JOB_TYPES.WEEKLY_SALES, { startDate, endDate });
};

/**
 * Schedule monthly sales report
 */
const scheduleMonthlySalesReport = async (year, month) => {
  return addReportJob(REPORT_JOB_TYPES.MONTHLY_SALES, { year, month });
};

/**
 * Schedule annual sales report
 */
const scheduleAnnualSalesReport = async (year) => {
  return addReportJob(REPORT_JOB_TYPES.ANNUAL_SALES, { year });
};

/**
 * Generate guest report on demand
 */
const generateOnDemandGuestReport = async (guestId, email) => {
  return addReportJob(
    REPORT_JOB_TYPES.GUEST_REPORT,
    { guestId },
    { sendEmail: true, email, store: true }
  );
};

/**
 * Get report queue stats
 */
const getReportQueueStats = async () => {
  const [
    waiting,
    active,
    completed,
    failed,
    delayed
  ] = await Promise.all([
    reportQueue.getWaitingCount(),
    reportQueue.getActiveCount(),
    reportQueue.getCompletedCount(),
    reportQueue.getFailedCount(),
    reportQueue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed
  };
};

// Event handlers
reportQueue.on('completed', (job) => {
  logger.info(`Report job ${job.id} completed`);
});

reportQueue.on('failed', (job, error) => {
  logger.error(`Report job ${job.id} failed:`, error.message);
});

module.exports = {
  reportQueue,
  REPORT_JOB_TYPES,
  addReportJob,
  generateDailySalesReport,
  generateWeeklySalesReport,
  generateMonthlySalesReport,
  generateAnnualSalesReport,
  generateOccupancyReport,
  generateRevenueReport,
  generateGuestReport,
  generateBookingReport,
  generateFinancialReport,
  generateCustomReport,
  scheduleDailySalesReport,
  scheduleWeeklySalesReport,
  scheduleMonthlySalesReport,
  scheduleAnnualSalesReport,
  generateOnDemandGuestReport,
  getReportQueueStats
};
