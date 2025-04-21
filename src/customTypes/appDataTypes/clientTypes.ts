export interface iBookingRequestDTO {
    name: string;
    email?: string;
    phoneNumber: string;
    date: Date;
    serviceId: string;
    location: string;
    notes?: string;
}