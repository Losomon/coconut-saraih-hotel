/**
 * Booking Socket Handler
 * Handles real-time booking-related socket events
 */

const Booking = require('../../models/Booking');
const { emitToRoom, emitToUser, emitToAll } = require('../index');

/**
 * Handle booking subscription
 * Subscribe a socket to booking updates
 */
const handleBookingSubscribe = async (socket, io, data) => {
  try {
    const { bookingId } = data;
    
    if (!bookingId) {
      socket.emit('error', { 
        code: 'BOOKING_ID_REQUIRED', 
        message: 'Booking ID is required' 
      });
      return;
    }

    // Join booking room
    const room = `booking:${bookingId}`;
    socket.join(room);
    
    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('guestId', 'firstName lastName email phone')
      .populate('roomId', 'roomNumber roomType')
      .lean();

    if (!booking) {
      socket.emit('booking:error', { 
        message: 'Booking not found' 
      });
      return;
    }

    // Verify user has access to this booking
    const userId = socket.user?.id;
    const isAdmin = ['admin', 'manager'].includes(socket.user?.role);
    
    if (!isAdmin && booking.guestId?._id?.toString() !== userId) {
      socket.emit('booking:error', { 
        message: 'Unauthorized access to this booking' 
      });
      return;
    }

    console.log(`Socket ${socket.id} subscribed to booking ${bookingId}`);
    
    // Send current booking state
    socket.emit('booking:subscribed', { 
      bookingId,
      booking: {
        status: booking.status,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        paymentStatus: booking.paymentStatus,
        room: booking.roomId
      }
    });

    // Notify other subscribers about new viewer
    socket.to(room).emit('booking:viewer_joined', {
      socketId: socket.id,
      userId: socket.user?.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Booking subscribe error:', error);
    socket.emit('booking:error', { 
      message: 'Failed to subscribe to booking updates' 
    });
  }
};

/**
 * Handle booking unsubscription
 */
const handleBookingUnsubscribe = (socket, data) => {
  const { bookingId } = data;
  
  if (!bookingId) return;

  const room = `booking:${bookingId}`;
  socket.leave(room);
  
  console.log(`Socket ${socket.id} unsubscribed from booking ${bookingId}`);
  
  // Notify other subscribers
  socket.to(room).emit('booking:viewer_left', {
    socketId: socket.id,
    userId: socket.user?.id,
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle booking status update
 * Admin/Staff only
 */
const handleBookingStatusUpdate = async (socket, io, data) => {
  try {
    const { bookingId, status, notes } = data;
    
    if (!bookingId || !status) {
      socket.emit('error', { 
        message: 'Booking ID and status are required' 
      });
      return;
    }

    // Check permissions
    if (!['admin', 'manager', 'staff'].includes(socket.user?.role)) {
      socket.emit('error', { 
        message: 'Unauthorized to update booking status' 
      });
      return;
    }

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status,
        ...(notes && { 'notes.statusUpdate': notes })
      },
      { new: true }
    ).populate('guestId', 'firstName lastName email');

    if (!booking) {
      socket.emit('booking:error', { message: 'Booking not found' });
      return;
    }

    // Emit update to all subscribers
    emitToRoom(`booking:${bookingId}`, 'booking:status_updated', {
      bookingId,
      status: booking.status,
      updatedAt: booking.updatedAt,
      updatedBy: socket.user.id,
      notes
    });

    // Notify guest if they have an account
    if (booking.guestId?._id) {
      emitToUser(booking.guestId._id.toString(), 'booking:status_changed', {
        bookingReference: booking.bookingReference,
        status: booking.status,
        message: `Your booking status has been updated to: ${status}`
      });
    }

    // Emit to admin dashboard
    io.to('admin:dashboard').emit('dashboard:booking_updated', {
      bookingId,
      status: booking.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Booking status update error:', error);
    socket.emit('booking:error', { 
      message: 'Failed to update booking status' 
    });
  }
};

/**
 * Handle payment status update
 */
const handlePaymentUpdate = async (socket, io, data) => {
  try {
    const { bookingId, paymentStatus, amount } = data;
    
    if (!bookingId || !paymentStatus) {
      socket.emit('error', { 
        message: 'Booking ID and payment status are required' 
      });
      return;
    }

    // Verify admin/manager role
    if (!['admin', 'manager'].includes(socket.user?.role)) {
      socket.emit('error', { 
        message: 'Unauthorized to update payment status' 
      });
      return;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        paymentStatus,
        ...(amount && { 'payment.amountPaid': amount })
      },
      { new: true }
    ).populate('guestId', 'firstName lastName email');

    if (!booking) {
      socket.emit('booking:error', { message: 'Booking not found' });
      return;
    }

    // Emit update
    emitToRoom(`booking:${bookingId}`, 'booking:payment_updated', {
      bookingId,
      paymentStatus: booking.paymentStatus,
      amount: amount || booking.payment?.amountPaid,
      updatedAt: new Date().toISOString()
    });

    // Notify guest
    if (booking.guestId?._id) {
      emitToUser(booking.guestId._id.toString(), 'booking:payment_status_changed', {
        bookingReference: booking.bookingReference,
        paymentStatus: booking.paymentStatus,
        message: `Payment status updated: ${paymentStatus}`
      });
    }

  } catch (error) {
    console.error('Payment update error:', error);
    socket.emit('booking:error', { 
      message: 'Failed to update payment status' 
    });
  }
};

/**
 * Handle room assignment
 */
const handleRoomAssignment = async (socket, io, data) => {
  try {
    const { bookingId, roomId, roomNumber } = data;
    
    if (!bookingId || !roomId) {
      socket.emit('error', { 
        message: 'Booking ID and Room ID are required' 
      });
      return;
    }

    // Verify staff role
    if (!['admin', 'manager', 'staff'].includes(socket.user?.role)) {
      socket.emit('error', { 
        message: 'Unauthorized to assign rooms' 
      });
      return;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        roomId,
        'roomDetails.number': roomNumber
      },
      { new: true }
    ).populate('guestId', 'firstName lastName email');

    if (!booking) {
      socket.emit('booking:error', { message: 'Booking not found' });
      return;
    }

    // Emit room assignment
    emitToRoom(`booking:${bookingId}`, 'booking:room_assigned', {
      bookingId,
      roomId,
      roomNumber,
      assignedAt: new Date().toISOString(),
      assignedBy: socket.user.id
    });

    // Notify guest
    if (booking.guestId?._id) {
      emitToUser(booking.guestId._id.toString(), 'booking:room_assigned', {
        bookingReference: booking.bookingReference,
        roomNumber,
        message: `Room ${roomNumber} has been assigned to your booking`
      });
    }

    // Update room availability for real-time
    emitRoomAvailabilityUpdate(io, roomId, 'occupied');

  } catch (error) {
    console.error('Room assignment error:', error);
    socket.emit('booking:error', { 
      message: 'Failed to assign room' 
    });
  }
};

/**
 * Emit room availability update
 */
const emitRoomAvailabilityUpdate = async (io, roomId, status) => {
  const Room = require('../../models/Room');
  
  try {
    const room = await Room.findById(roomId).lean();
    if (!room) return;

    // Broadcast to all room subscribers
    io.to(`room:${roomId}`).emit('room:availability', {
      roomId,
      roomNumber: room.roomNumber,
      status,
      updatedAt: new Date().toISOString()
    });

    // Update admin dashboard
    io.to('admin:dashboard').emit('dashboard:room_status_changed', {
      roomId,
      roomNumber: room.roomNumber,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Room availability emit error:', error);
  }
};

/**
 * Handle check-in event
 */
const handleCheckIn = async (socket, io, data) => {
  try {
    const { bookingId } = data;
    
    if (!bookingId) {
      socket.emit('error', { message: 'Booking ID is required' });
      return;
    }

    // Verify staff role
    if (!['admin', 'manager', 'staff'].includes(socket.user?.role)) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status: 'checked-in',
        'timestamps.checkedInAt': new Date()
      },
      { new: true }
    ).populate('guestId', 'firstName lastName email');

    if (!booking) {
      socket.emit('booking:error', { message: 'Booking not found' });
      return;
    }

    // Emit check-in event
    emitToRoom(`booking:${bookingId}`, 'booking:check_in', {
      bookingId,
      checkedInAt: booking.timestamps.checkedInAt,
      checkedInBy: socket.user.id
    });

    // Notify guest
    if (booking.guestId?._id) {
      emitToUser(booking.guestId._id.toString(), 'booking:check_in_confirmed', {
        bookingReference: booking.bookingReference,
        roomNumber: booking.roomDetails?.number,
        message: 'Welcome! You have been checked in successfully.'
      });
    }

    // Dashboard update
    io.to('admin:dashboard').emit('dashboard:check_in', {
      bookingId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Check-in error:', error);
    socket.emit('booking:error', { message: 'Check-in failed' });
  }
};

/**
 * Handle check-out event
 */
const handleCheckOut = async (socket, io, data) => {
  try {
    const { bookingId } = data;
    
    if (!bookingId) {
      socket.emit('error', { message: 'Booking ID is required' });
      return;
    }

    // Verify staff role
    if (!['admin', 'manager', 'staff'].includes(socket.user?.role)) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status: 'checked-out',
        'timestamps.checkedOutAt': new Date()
      },
      { new: true }
    ).populate('guestId', 'firstName lastName email');

    if (!booking) {
      socket.emit('booking:error', { message: 'Booking not found' });
      return;
    }

    // Emit check-out event
    emitToRoom(`booking:${bookingId}`, 'booking:check_out', {
      bookingId,
      checkedOutAt: booking.timestamps.checkedOutAt,
      checkedOutBy: socket.user.id
    });

    // Notify guest
    if (booking.guestId?._id) {
      emitToUser(booking.guestId._id.toString(), 'booking:check_out_confirmed', {
        bookingReference: booking.bookingReference,
        message: 'Thank you for staying with us! We hope to see you again soon.'
      });
    }

    // Request feedback
    socket.to(`user:${booking.guestId?._id}`).emit('booking:feedback_request', {
      bookingId,
      message: 'We\'d love your feedback on your recent stay!'
    });

    // Dashboard update
    io.to('admin:dashboard').emit('dashboard:check_out', {
      bookingId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Check-out error:', error);
    socket.emit('booking:error', { message: 'Check-out failed' });
  }
};

/**
 * Request booking cancellation
 */
const handleCancellationRequest = async (socket, io, data) => {
  try {
    const { bookingId, reason } = data;
    
    if (!bookingId) {
      socket.emit('error', { message: 'Booking ID is required' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      socket.emit('booking:error', { message: 'Booking not found' });
      return;
    }

    // Verify ownership or admin
    const isOwner = booking.guestId?.toString() === socket.user?.id;
    const isAdmin = ['admin', 'manager'].includes(socket.user?.role);
    
    if (!isOwner && !isAdmin) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    // Check if cancellation is allowed
    if (!['pending', 'confirmed'].includes(booking.status)) {
      socket.emit('booking:error', { 
        message: 'Cannot cancel booking in current status' 
      });
      return;
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: socket.user.id,
      reason: reason || 'No reason provided',
      refundStatus: 'pending'
    };
    
    await booking.save();

    // Emit cancellation
    emitToRoom(`booking:${bookingId}`, 'booking:cancelled', {
      bookingId,
      cancelledAt: booking.cancellation.cancelledAt,
      reason: reason
    });

    // Notify admin
    io.to('admin:dashboard').emit('dashboard:booking_cancelled', {
      bookingId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cancellation error:', error);
    socket.emit('booking:error', { message: 'Cancellation failed' });
  }
};

/**
 * Register all booking event handlers
 */
const registerBookingHandlers = (io, socket) => {
  socket.on('booking:subscribe', (data) => handleBookingSubscribe(socket, io, data));
  socket.on('booking:unsubscribe', (data) => handleBookingUnsubscribe(socket, data));
  socket.on('booking:update_status', (data) => handleBookingStatusUpdate(socket, io, data));
  socket.on('booking:update_payment', (data) => handlePaymentUpdate(socket, io, data));
  socket.on('booking:assign_room', (data) => handleRoomAssignment(socket, io, data));
  socket.on('booking:check_in', (data) => handleCheckIn(socket, io, data));
  socket.on('booking:check_out', (data) => handleCheckOut(socket, io, data));
  socket.on('booking:cancel', (data) => handleCancellationRequest(socket, io, data));
};

module.exports = {
  registerBookingHandlers,
  handleBookingSubscribe,
  handleBookingUnsubscribe,
  handleBookingStatusUpdate,
  handlePaymentUpdate,
  handleRoomAssignment,
  handleCheckIn,
  handleCheckOut,
  handleCancellationRequest
};
