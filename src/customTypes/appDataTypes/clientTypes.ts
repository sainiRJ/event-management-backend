export interface iBookingRequestDTO {
    name: string;
    email?: string;
    phoneNumber: string;
    date: string;
    serviceId: string;
    location: string;
    notes?: string;
}