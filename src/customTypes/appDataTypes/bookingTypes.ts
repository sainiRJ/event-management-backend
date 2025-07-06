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
	userId: string | undefined;
	assignedEmployeeIds?: string[]; // Optional array of employee IDs to assign
  }

 export interface iBookingUpdateDTO {
    serviceId?: string;
    bookingStatusId?: string;
    paymentStatusId?: string;
    budget?: string;
	advancePayment?: string;
    customerName?: string;
    phoneNumber?: string;
    eventDate?: string; // ISO date string
    eventName?: string;
    venueAddress?: string;
	assignedEmployeeIds?: string[]; // Optional array of employee IDs to assign
}

export interface iAssignedEmployee {
	id: string;
	name: string;
	designation: string;
	assignedAt: Date;
	status: string;
	notes?: string;
}
  