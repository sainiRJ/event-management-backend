export interface iBookingCreateDTO {
    customerName: string;
    phoneNumber: string;
    eventDate: string;
    serviceId: string;
    venueAddress: string; 
    decorationTheme: string;
    additionalNotes?: string;
    budget: string;
    bookingStatusId: string;
    paymentStatusId: string;
    eventName: string;
    advancePayment: string;

  }

 export interface iBookingUpdateDTO {
    serviceId?: string;
    statusId?: string;
    paymentStatusId?: string;
    budget?: string;
    customerName?: string;
    phoneNumber?: string;
    eventDate?: string; // ISO date string
    eventName?: string;
    venueAddress?: string;
}
  