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
    userId: string | undefined

  }

 export interface iBookingUpdateDTO {
    serviceId?: string;
    bookingStatus?: string;
    paymentStatus?: string;
    budget?: string;
    customerName?: string;
    phoneNumber?: string;
    eventDate?: string; // ISO date string
    eventName?: string;
    venueAddress?: string;
}
  