import axios from "axios";
import {prisma} from "../prisma/prismaClient";
import { parseUserDate } from "../utils/dateParser";
import securityUtil from "../utils/securityUtil";



// map serviceType string to your internal serviceId
const serviceTypeToIdMap: Record<string, string> = {
  "stage decoration": "7010dfae-f354-11ef-a485-00163c34c678",
  "stage": "7010dfae-f354-11ef-a485-00163c34c678",
  "haldi decoration": "7010e146-f354-11ef-a485-00163c34c678",
  "haldi": "7010e146-f354-11ef-a485-00163c34c678",
  "mandap": "7010db16-f354-11ef-a485-00163c34c678",
  "mandap setup": "7010db16-f354-11ef-a485-00163c34c678",
  "car decoration": "7010c66e-f354-11ef-a485-00163c34c678",
  "car": "7010c66e-f354-11ef-a485-00163c34c678",
};

async function getServiceIdByType(serviceType: string): Promise<string | null> {
  return serviceTypeToIdMap[serviceType.toLowerCase()] || null;
}

export async function checkAvailabilityTool(args: { serviceType: string, date: string }) {
  console.log("args ", args)
  const serviceId = await getServiceIdByType(args.serviceType);
  console.log("serviceId", serviceId);
  if (!serviceId) return { available: false, message: `Service not found: ${args.serviceType}` };

    const parsedDate = parseUserDate(args.date);
    if (!parsedDate) {
      return {
        available: false,
        message: `❗ Invalid or unclear date: "${args.date}". Please provide a valid date like "25 July" or "1 June 2026".`
      };
    }

    const formattedDate = parsedDate.toISOString().split("T")[0];
    console.log("formattedDate", formattedDate)
    try {
        const anyBookingExist = await prisma.bookings.findFirst({
          where: {
            serviceId: serviceId,
            events: {
              is: {
                eventDate: new Date(formattedDate), // Date type required
              },
             },
          },
        });
        console.log("anyBookingExist", anyBookingExist);
        if (anyBookingExist) {
          return {
            available: false,
            message: `❌ Sorry, ${args.serviceType} is already booked on ${formattedDate}.`,
          };
        }

        return {
          available: true,
          message: `✅ Yes, ${args.serviceType} is available on ${formattedDate}. Would you like to book it?`,
        };
          
    } catch (error) {
      console.log(error)
      return {
        message: "there is something problem to check availability. please check sometimes later"
      }
    }
}

export async function createBookingTool(args: {
  name: string;
  phoneNumber: string;
  email?: string;
  serviceType: string;
  date: string;
  location: string;
  notes?: string;
}) {
  const serviceId = await getServiceIdByType(args.serviceType);
  if (!serviceId) return { success: false, message: `Service not found: ${args.serviceType}` };

  const serviceExist = await prisma.service.findUnique({
				where: {
					id: serviceId,
				},
			});
      if (!serviceExist){
        return {
          message: "there is something problem . please make booking request sometimes later"
        }
      }
    const parsedDate = parseUserDate(args.date);
    if (!parsedDate) {
      return {
        available: false,
        message: `❗ Invalid or unclear date: "${args.date}". Please provide a valid date like "25 July" or "1 June 2026".`
      };
    }

    const formattedDate = parsedDate.toISOString().split("T")[0];

  const event = await prisma.event.create({
          data: {
            id: securityUtil.generateUUID(),
            customerName: args.name,
            phoneNumber: args.phoneNumber,
            email: args.email || null,
            eventName: "Booking Request",
            eventDate: new Date(formattedDate),
            location: args.location,
            createdAt: new Date(),
          },
        });
  
        // Get pending status IDs
        const pendingStatus = await prisma.status.findFirst({
          where: {
            context: "booking",
            name: "pending",
          },
        });

        if(!pendingStatus) {
          return {
            message: "there is some internal problem during booking request. sorry for the inconvenience. please make booking request some times later"
          }
        }
  
        // Create booking with client source
        const booking = await prisma.bookings.create({
          data: {
            id: securityUtil.generateUUID(),
            eventId: event.id,
            serviceId: serviceId,
            vendorId: serviceExist.vendorId,
            statusId: pendingStatus.id,
            paymentStatusId: pendingStatus.id,
            totalCost: 0, // Will be set by vendor later
            advancePayment: 0, // Will be set by vendor later
            isOnlineBooking: true,
            notes: args.notes,
            bookedAt: new Date(),
          },
        });

        if (booking){
          return {
            isBooked: true,
            message: "Thank you for make bboking request on ssaini events. Our Team will check your booking request  and will contact on your provided phone number as soon as possible."
          }
        }

        return {
          isBooked: false,
          message:  "there is some internal problem during booking request. sorry for the inconvenience. please make booking request some times later"
        };
}

export async function showPhotosTool(args: { serviceType: string }) {
  const serviceId = await getServiceIdByType(args.serviceType);
  if (!serviceId) return { success: false, message: `Service not found: ${args.serviceType}` };

  try {
    const photos = await prisma.decorationPhoto.findMany({
      where: {
        serviceId: serviceId,
      },
      select: {
        id: true,
        url: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3, // Limit to 3 photos
    });

    if (photos.length === 0) {
      return {
        success: true,
        photos: [],
        message: `No photos available for ${args.serviceType} at the moment.`,
      };
    }

    return {
      success: true,
      photos: photos,
      message: `Here are ${photos.length} photos for ${args.serviceType}:`,
    };
  } catch (error) {
    console.error('Error fetching photos:', error);
    return {
      success: false,
      message: "Sorry, there was an error fetching photos. Please try again later.",
    };
  }
}
