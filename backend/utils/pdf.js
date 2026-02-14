/**
 * PDF Generation Utility
 * Provides PDF generation functions for various documents
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper to format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Helper to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Colors
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  dark: '#333333',
  gray: '#666666',
  lightGray: '#999999',
  white: '#ffffff',
  background: '#f8f9fa'
};

// Base PDF options
const getBaseOptions = () => ({
  size: 'A4',
  margin: 50,
  info: {
    Title: 'Coconut Saraih Hotel',
    Author: 'Coconut Saraih Hotel',
    Subject: 'Hotel Document'
  }
});

/**
 * Add header with logo and hotel info
 */
const addHeader = (doc, title) => {
  const primaryColor = COLORS.primary;
  
  // Header background
  doc.rect(0, 0, doc.page.width, 80)
     .fill('linear(0, 0, ${doc.page.width}, 80) = #667eea, #764ba2');
  
  // Hotel name
  doc.fillColor(COLORS.white)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('🏝️ Coconut Saraih Hotel', 50, 25);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('Zanzibar, Tanzania', 50, 50)
     .text('+255 700 000 000 | info@coconutsaraih.com', 50, 62);
  
  // Document title
  doc.fillColor(COLORS.dark)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text(title, 50, 110);
  
  // Horizontal line
  doc.moveTo(50, 145)
     .lineTo(doc.page.width - 50, 145)
     .strokeColor(primaryColor)
     .lineWidth(2)
     .stroke();
  
  return 160;
};

/**
 * Add footer with page numbers
 */
const addFooter = (doc, pageNum, totalPages) => {
  const y = doc.page.height - 50;
  
  // Line
  doc.moveTo(50, y - 10)
     .lineTo(doc.page.width - 50, y - 10)
     .strokeColor(COLORS.lightGray)
     .lineWidth(1)
     .stroke();
  
  // Footer text
  doc.fillColor(COLORS.gray)
     .fontSize(9)
     .font('Helvetica')
     .text(
       `Coconut Saraih Hotel - Page ${pageNum} of ${totalPages}`,
       50,
       y,
       { align: 'center', width: doc.page.width - 100 }
     )
     .text(
       `Generated on ${new Date().toLocaleString()}`,
       50,
       y + 12,
       { align: 'center', width: doc.page.width - 100 }
     );
};

/**
 * Generate Booking Confirmation PDF
 */
const generateBookingConfirmationPDF = async (booking, guest) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument(getBaseOptions());
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      const contentY = addHeader(doc, 'Booking Confirmation');
      
      // Booking details
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Booking Details', 50, contentY);
      
      let y = contentY + 25;
      
      const details = [
        { label: 'Booking Reference', value: booking.bookingReference },
        { label: 'Guest Name', value: `${guest.firstName} ${guest.lastName}` },
        { label: 'Email', value: guest.email },
        { label: 'Phone', value: guest.phone || 'N/A' },
        { label: 'Check-in Date', value: formatDate(booking.checkIn) },
        { label: 'Check-out Date', value: formatDate(booking.checkOut) },
        { label: 'Number of Guests', value: booking.guests.toString() },
        { label: 'Room Type', value: booking.roomType },
        { label: 'Number of Nights', value: booking.numberOfNights.toString() }
      ];
      
      doc.font('Helvetica').fontSize(11);
      details.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 200, y);
        y += 18;
      });
      
      // Payment summary
      y += 20;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Payment Summary', 50, y);
      
      y += 25;
      
      const paymentDetails = [
        { label: 'Room Rate per Night', value: formatCurrency(booking.roomRate, booking.currency) },
        { label: 'Number of Nights', value: booking.numberOfNights.toString() },
        { label: 'Subtotal', value: formatCurrency(booking.subtotal, booking.currency) },
        { label: 'Tax (16%)', value: formatCurrency(booking.taxAmount, booking.currency) },
        { label: 'Total Amount', value: formatCurrency(booking.totalAmount, booking.currency), bold: true }
      ];
      
      doc.font('Helvetica').fontSize(11);
      paymentDetails.forEach(detail => {
        if (detail.bold) {
          doc.font('Helvetica-Bold');
        } else {
          doc.font('Helvetica');
        }
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 350, y);
        y += 18;
      });
      
      // Notes
      y += 30;
      doc.fillColor(COLORS.primary)
         .fontSize(10)
         .text('Important Information:', 50, y);
      
      y += 18;
      doc.fillColor(COLORS.gray)
         .fontSize(10)
         .font('Helvetica')
         .text('• Check-in time: 2:00 PM', 50, y);
      doc.text('• Check-out time: 11:00 AM', 50, y + 14);
      doc.text('• Please present this confirmation upon arrival', 50, y + 28);
      doc.text('• Valid ID or passport required for check-in', 50, y + 42);
      
      // Footer
      addFooter(doc, 1, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Invoice PDF
 */
const generateInvoicePDF = async (invoice, booking, guest) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument(getBaseOptions());
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      const contentY = addHeader(doc, 'Invoice');
      
      // Invoice info
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Invoice Details', 50, contentY);
      
      let y = contentY + 25;
      
      const invoiceDetails = [
        { label: 'Invoice Number', value: invoice.invoiceNumber },
        { label: 'Invoice Date', value: formatDate(invoice.createdAt) },
        { label: 'Due Date', value: invoice.dueDate ? formatDate(invoice.dueDate) : 'Due on Receipt' },
        { label: 'Booking Reference', value: booking.bookingReference }
      ];
      
      doc.font('Helvetica').fontSize(11);
      invoiceDetails.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 200, y);
        y += 18;
      });
      
      // Guest details
      y += 20;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Bill To', 50, y);
      
      y += 25;
      doc.font('Helvetica').fontSize(11)
         .fillColor(COLORS.dark)
         .text(`${guest.firstName} ${guest.lastName}`, 50, y)
         .fillColor(COLORS.gray)
         .text(guest.email, 50, y + 14)
         .text(guest.phone || '', 50, y + 28);
      
      // Room details
      y += 60;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Stay Details', 50, y);
      
      y += 25;
      
      const stayDetails = [
        { label: 'Check-in', value: formatDate(booking.checkIn) },
        { label: 'Check-out', value: formatDate(booking.checkOut) },
        { label: 'Room Type', value: booking.roomType },
        { label: 'Guests', value: booking.guests.toString() }
      ];
      
      doc.font('Helvetica').fontSize(11);
      stayDetails.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 200, y);
        y += 18;
      });
      
      // Charges table header
      y += 30;
      doc.rect(50, y, doc.page.width - 100, 25)
         .fill(COLORS.primary);
      
      doc.fillColor(COLORS.white)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('Description', 60, y + 8)
         .text('Amount', doc.page.width - 140, y + 8);
      
      y += 25;
      
      // Charges
      const charges = [
        { description: `Room Charges (${booking.numberOfNights} nights)`, amount: invoice.roomCharges },
        { description: `Tax (${(invoice.taxRate * 100).toFixed(0)}%)`, amount: invoice.taxAmount }
      ];
      
      if (invoice.discount) {
        charges.push({ description: 'Discount', amount: -invoice.discount });
      }
      
      charges.forEach((charge, index) => {
        const bgColor = index % 2 === 0 ? COLORS.background : COLORS.white;
        doc.rect(50, y, doc.page.width - 100, 20).fill(bgColor);
        
        doc.fillColor(COLORS.dark)
           .font('Helvetica')
           .fontSize(10)
           .text(charge.description, 60, y + 5)
           .text(formatCurrency(charge.amount, invoice.currency), doc.page.width - 140, y + 5);
        
        y += 20;
      });
      
      // Total
      y += 10;
      doc.rect(50, y, doc.page.width - 100, 30).fill(COLORS.dark);
      
      doc.fillColor(COLORS.white)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Total Due:', 60, y + 9)
         .text(formatCurrency(invoice.totalAmount, invoice.currency), doc.page.width - 150, y + 9);
      
      // Payment status
      if (invoice.paidAmount) {
        y += 40;
        doc.fillColor(COLORS.primary)
           .font('Helvetica-Bold')
           .fontSize(11)
           .text(`Amount Paid: ${formatCurrency(invoice.paidAmount, invoice.currency)}`, 50, y);
        
        y += 18;
        const balance = invoice.totalAmount - invoice.paidAmount;
        if (balance > 0) {
          doc.fillColor('#e74c3c')
             .text(`Balance Due: ${formatCurrency(balance, invoice.currency)}`, 50, y);
        } else {
          doc.fillColor('#27ae60')
             .text('Paid in Full', 50, y);
        }
      }
      
      // Footer
      addFooter(doc, 1, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Receipt PDF
 */
const generateReceiptPDF = async (payment, booking, guest) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument(getBaseOptions());
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      const contentY = addHeader(doc, 'Payment Receipt');
      
      // Receipt info
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Receipt Details', 50, contentY);
      
      let y = contentY + 25;
      
      const receiptDetails = [
        { label: 'Receipt Number', value: `RCP-${payment.paymentReference}` },
        { label: 'Payment Date', value: formatDate(payment.createdAt) },
        { label: 'Payment Reference', value: payment.paymentReference },
        { label: 'Transaction ID', value: payment.transactionId || 'N/A' }
      ];
      
      doc.font('Helvetica').fontSize(11);
      receiptDetails.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 200, y);
        y += 18;
      });
      
      // Guest info
      y += 20;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Guest Information', 50, y);
      
      y += 25;
      doc.font('Helvetica').fontSize(11)
         .fillColor(COLORS.dark)
         .text(`${guest.firstName} ${guest.lastName}`, 50, y)
         .fillColor(COLORS.gray)
         .text(guest.email, 50, y + 14);
      
      // Booking reference
      y += 40;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Booking Reference', 50, y);
      
      y += 25;
      doc.font('Helvetica-Bold').fontSize(16)
         .fillColor(COLORS.primary)
         .text(booking.bookingReference, 50, y);
      
      // Payment details
      y += 40;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Payment Details', 50, y);
      
      y += 25;
      
      const paymentDetails = [
        { label: 'Amount Paid', value: formatCurrency(payment.amount, payment.currency), bold: true },
        { label: 'Payment Method', value: payment.paymentMethod },
        { label: 'Payment Status', value: payment.status, green: payment.status === 'completed' }
      ];
      
      doc.font('Helvetica').fontSize(11);
      paymentDetails.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        if (detail.green) {
          doc.fillColor('#27ae60');
        } else if (detail.bold) {
          doc.font('Helvetica-Bold').fillColor(COLORS.primary);
        } else {
          doc.fillColor(COLORS.dark);
        }
        doc.text(detail.value, 200, y);
        y += 18;
      });
      
      // Thank you message
      y += 40;
      doc.fillColor(COLORS.primary)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text('Thank you for your payment!', 50, y, { align: 'center', width: doc.page.width - 100 });
      
      y += 25;
      doc.fillColor(COLORS.gray)
         .font('Helvetica')
         .fontSize(10)
         .text(
           'This is an official receipt for your payment. Please keep this for your records.',
           50,
           y,
           { align: 'center', width: doc.page.width - 100 }
         );
      
      // Footer
      addFooter(doc, 1, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Activity Booking Confirmation PDF
 */
const generateActivityConfirmationPDF = async (activityBooking, guest) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument(getBaseOptions());
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      const contentY = addHeader(doc, 'Activity Booking Confirmation');
      
      // Activity details
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Activity Details', 50, contentY);
      
      let y = contentY + 25;
      
      const activityDetails = [
        { label: 'Booking Reference', value: activityBooking.bookingReference },
        { label: 'Activity', value: activityBooking.activityName },
        { label: 'Date', value: formatDate(activityBooking.date) },
        { label: 'Time', value: activityBooking.time },
        { label: 'Duration', value: activityBooking.duration || 'N/A' },
        { label: 'Number of Guests', value: activityBooking.guests.toString() }
      ];
      
      doc.font('Helvetica').fontSize(11);
      activityDetails.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 200, y);
        y += 18;
      });
      
      // Guest info
      y += 20;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Guest Information', 50, y);
      
      y += 25;
      doc.font('Helvetica').fontSize(11)
         .fillColor(COLORS.dark)
         .text(`${guest.firstName} ${guest.lastName}`, 50, y)
         .fillColor(COLORS.gray)
         .text(guest.email, 50, y + 14)
         .text(guest.phone || '', 50, y + 28);
      
      // Payment
      y += 55;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Payment Summary', 50, y);
      
      y += 25;
      
      const paymentDetails = [
        { label: 'Price per Person', value: formatCurrency(activityBooking.pricePerPerson, activityBooking.currency) },
        { label: 'Number of Guests', value: activityBooking.guests.toString() },
        { label: 'Total Amount', value: formatCurrency(activityBooking.totalAmount, activityBooking.currency), bold: true }
      ];
      
      doc.font('Helvetica').fontSize(11);
      paymentDetails.forEach(detail => {
        if (detail.bold) {
          doc.font('Helvetica-Bold');
        } else {
          doc.font('Helvetica');
        }
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 350, y);
        y += 18;
      });
      
      // Meeting info
      y += 30;
      doc.fillColor(COLORS.primary)
         .fontSize(10)
         .text('Meeting Point: ' + (activityBooking.meetingPoint || 'Hotel Lobby'), 50, y);
      
      y += 18;
      doc.fillColor(COLORS.primary)
         .text('Please arrive 15 minutes before the scheduled time.', 50, y);
      
      // Footer
      addFooter(doc, 1, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Restaurant Reservation PDF
 */
const generateRestaurantReservationPDF = async (reservation, guest) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument(getBaseOptions());
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      const contentY = addHeader(doc, 'Table Reservation Confirmation');
      
      // Reservation details
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Reservation Details', 50, contentY);
      
      let y = contentY + 25;
      
      const reservationDetails = [
        { label: 'Reservation Reference', value: reservation.reservationReference },
        { label: 'Restaurant', value: reservation.restaurantName },
        { label: 'Date', value: formatDate(reservation.date) },
        { label: 'Time', value: reservation.time },
        { label: 'Number of Guests', value: reservation.guests.toString() },
        { label: 'Table Type', value: reservation.tableType || 'Standard' }
      ];
      
      doc.font('Helvetica').fontSize(11);
      reservationDetails.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 200, y);
        y += 18;
      });
      
      // Guest info
      y += 20;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Guest Information', 50, y);
      
      y += 25;
      doc.font('Helvetica').fontSize(11)
         .fillColor(COLORS.dark)
         .text(`${guest.firstName} ${guest.lastName}`, 50, y)
         .fillColor(COLORS.gray)
         .text(guest.email, 50, y + 14)
         .text(guest.phone || '', 50, y + 28);
      
      // Special requests
      if (reservation.specialRequests) {
        y += 50;
        doc.fillColor(COLORS.dark)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Special Requests', 50, y);
        
        y += 20;
        doc.font('Helvetica').fontSize(11)
           .fillColor(COLORS.gray)
           .text(reservation.specialRequests, 50, y, {
             width: doc.page.width - 100,
             align: 'left'
           });
      }
      
      // Additional info
      y += 40;
      doc.fillColor(COLORS.primary)
         .fontSize(10)
         .text('Please arrive a few minutes before your reservation time.', 50, y);
      
      y += 18;
      doc.text('Formal dress code is recommended.', 50, y);
      
      y += 18;
      doc.text('For modifications or cancellations, please contact us at least 2 hours before.', 50, y);
      
      // Footer
      addFooter(doc, 1, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Guest Report PDF (for admin)
 */
const generateGuestReportPDF = async (guest, bookings, stats) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument(getBaseOptions());
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      const contentY = addHeader(doc, 'Guest Profile Report');
      
      // Guest details
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Guest Information', 50, contentY);
      
      let y = contentY + 25;
      
      const guestDetails = [
        { label: 'Name', value: `${guest.firstName} ${guest.lastName}` },
        { label: 'Email', value: guest.email },
        { label: 'Phone', value: guest.phone || 'N/A' },
        { label: 'Country', value: guest.country || 'N/A' },
        { label: 'Member Since', value: formatDate(guest.createdAt) },
        { label: 'Loyalty Tier', value: guest.loyaltyTier || 'None' }
      ];
      
      doc.font('Helvetica').fontSize(11);
      guestDetails.forEach(detail => {
        doc.fillColor(COLORS.gray)
           .text(detail.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(detail.value, 200, y);
        y += 18;
      });
      
      // Statistics
      y += 30;
      doc.fillColor(COLORS.dark)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Stay Statistics', 50, y);
      
      y += 25;
      
      const statsData = [
        { label: 'Total Bookings', value: stats.totalBookings.toString() },
        { label: 'Total Nights Stayed', value: stats.totalNights.toString() },
        { label: 'Total Spent', value: formatCurrency(stats.totalSpent, 'USD') },
        { label: 'Average Nightly Rate', value: formatCurrency(stats.avgNightlyRate, 'USD') },
        { label: 'Last Stay', value: stats.lastStay ? formatDate(stats.lastStay) : 'N/A' }
      ];
      
      doc.font('Helvetica').fontSize(11);
      statsData.forEach(stat => {
        doc.fillColor(COLORS.gray)
           .text(stat.label + ':', 50, y);
        doc.fillColor(COLORS.primary)
           .font('Helvetica-Bold')
           .text(stat.value, 200, y);
        doc.font('Helvetica').fillColor(COLORS.dark);
        y += 18;
      });
      
      // Recent bookings
      if (bookings && bookings.length > 0) {
        y += 30;
        doc.fillColor(COLORS.dark)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Recent Bookings', 50, y);
        
        y += 25;
        
        // Table header
        doc.rect(50, y, doc.page.width - 100, 20).fill(COLORS.primary);
        doc.fillColor(COLORS.white)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Ref', 55, y + 5)
           .text('Check-in', 130, y + 5)
           .text('Check-out', 230, y + 5)
           .text('Room', 330, y + 5)
           .text('Amount', 430, y + 5);
        
        y += 20;
        
        // Table rows
        bookings.slice(0, 10).forEach((booking, index) => {
          const bgColor = index % 2 === 0 ? COLORS.background : COLORS.white;
          doc.rect(50, y, doc.page.width - 100, 18).fill(bgColor);
          
          doc.fillColor(COLORS.dark)
             .font('Helvetica')
             .fontSize(8)
             .text(booking.bookingReference, 55, y + 4)
             .text(formatDate(booking.checkIn), 130, y + 4)
             .text(formatDate(booking.checkOut), 230, y + 4)
             .text(booking.roomType, 330, y + 4)
             .text(formatCurrency(booking.totalAmount, booking.currency), 430, y + 4);
          
          y += 18;
        });
      }
      
      // Footer
      addFooter(doc, 1, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Daily Sales Report PDF (for admin)
 */
const generateDailySalesReportPDF = async (reportData, date) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Daily Sales Report',
          Author: 'Coconut Saraih Hotel',
          Subject: 'Sales Report'
        }
      });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      doc.rect(0, 0, doc.page.width, 80)
         .fill('linear(0, 0, ${doc.page.width}, 80) = #667eea, #764ba2');
      
      doc.fillColor(COLORS.white)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('Daily Sales Report', 50, 25);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Date: ${formatDate(date)}`, 50, 50);
      
      // Summary
      let y = 110;
      doc.fillColor(COLORS.dark)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Summary', 50, y);
      
      y += 25;
      
      const summaryData = [
        { label: 'Total Revenue', value: formatCurrency(reportData.totalRevenue, 'USD'), bold: true },
        { label: 'Room Revenue', value: formatCurrency(reportData.roomRevenue, 'USD') },
        { label: 'Food & Beverage', value: formatCurrency(reportData.fbRevenue, 'USD') },
        { label: 'Activities', value: formatCurrency(reportData.activityRevenue, 'USD') },
        { label: 'Spa', value: formatCurrency(reportData.spaRevenue, 'USD') },
        { label: 'Total Bookings', value: reportData.totalBookings.toString() },
        { label: 'Check-ins', value: reportData.checkIns.toString() },
        { label: 'Check-outs', value: reportData.checkOuts.toString() },
        { label: 'Occupancy Rate', value: `${reportData.occupancyRate}%` }
      ];
      
      doc.font('Helvetica').fontSize(11);
      summaryData.forEach(data => {
        if (data.bold) {
          doc.font('Helvetica-Bold').fontSize(12);
        } else {
          doc.font('Helvetica').fontSize(11);
        }
        doc.fillColor(COLORS.gray)
           .text(data.label + ':', 50, y);
        doc.fillColor(COLORS.dark)
           .text(data.value, 300, y);
        y += 20;
      });
      
      // Top Rooms
      if (reportData.topRooms && reportData.topRooms.length > 0) {
        y += 30;
        doc.fillColor(COLORS.dark)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Top Selling Rooms', 50, y);
        
        y += 25;
        
        // Table header
        doc.rect(50, y, doc.page.width - 100, 20).fill(COLORS.primary);
        doc.fillColor(COLORS.white)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Room Type', 55, y + 5)
           .text('Bookings', 180, y + 5)
           .text('Revenue', 280, y + 5)
           .text('% of Total', 400, y + 5);
        
        y += 20;
        
        reportData.topRooms.forEach((room, index) => {
          const bgColor = index % 2 === 0 ? COLORS.background : COLORS.white;
          doc.rect(50, y, doc.page.width - 100, 18).fill(bgColor);
          
          doc.fillColor(COLORS.dark)
             .font('Helvetica')
             .fontSize(9)
             .text(room.type, 55, y + 4)
             .text(room.bookings.toString(), 180, y + 4)
             .text(formatCurrency(room.revenue, 'USD'), 280, y + 4)
             .text(`${room.percentage}%`, 400, y + 4);
          
          y += 18;
        });
      }
      
      // Footer
      addFooter(doc, 1, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateBookingConfirmationPDF,
  generateInvoicePDF,
  generateReceiptPDF,
  generateActivityConfirmationPDF,
  generateRestaurantReservationPDF,
  generateGuestReportPDF,
  generateDailySalesReportPDF,
  formatCurrency,
  formatDate
};
