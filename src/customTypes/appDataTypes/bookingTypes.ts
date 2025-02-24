export interface iBookingCreateDTO {
    customerName: string;
    phoneNumber: string;
    eventDateTime: string;
    serviceId: string;
    venueAddress: string; 
    decorationTheme: string;
    additionalNotes?: string;
    budget: string;
    bookingStatusId: string;
    paymentStatusId: string;
    eventName: string;

  }

 export interface iBookingUpdateDTO {
    serviceId?: string;
    statusId?: string;
    paymentStatusId?: string;
    budget?: string;
    customerName?: string;
    phoneNumber?: string;
    eventDateTime?: string; // ISO date string
    eventName?: string;
    venueAddress?: string;
}
  