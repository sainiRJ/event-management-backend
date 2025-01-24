export interface iBookingCreateDTO {
    customerName: string; // Customer's full name
    phoneNumber: string; // Valid phone number with 10-15 digits
    email: string; // Customer's email address
    eventDateTime: string; // ISO 8601 formatted date-time string
    eventType: string; // Type of event (must match a predefined event type)
    venueAddress: string; // Address of the event venue
    decorationTheme: string; // Selected decoration theme (must match a predefined theme)
    additionalNotes?: string; // Optional notes about the booking
    budget: string; // Budget for the event (non-negative number)
  }
  