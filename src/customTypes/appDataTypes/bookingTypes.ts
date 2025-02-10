export interface iBookingCreateDTO {
    customerName: string;
    phoneNumber: string;
    email: string;
    eventDateTime: string;
    eventType: string;
    venueAddress: string; 
    decorationTheme: string;
    additionalNotes?: string;
    budget: string;
  }
  