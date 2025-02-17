export interface iBookingCreateDTO {
    customerName: string;
    phoneNumber: string;
    eventDateTime: string;
    serviceId: string;
    venueAddress: string; 
    decorationTheme: string;
    additionalNotes?: string;
    budget: string;
    statusId: string;
    paymentStatusId: string;
    eventName: string;

  }
  