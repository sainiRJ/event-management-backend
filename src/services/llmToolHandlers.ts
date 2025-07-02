import axios from "axios";
import {prisma} from "../prisma/prismaClient";


// map serviceType string to your internal serviceId
const serviceTypeToIdMap: Record<string, string> = {
  "stage decoration": "7010dfae-f354-11ef-a485-00163c34c678",
  "haldi decoration": "7010e146-f354-11ef-a485-00163c34c678",
  "mandap": "7010db16-f354-11ef-a485-00163c34c678",
  "car decoration": "7010c66e-f354-11ef-a485-00163c34c678"
};

async function getServiceIdByType(serviceType: string): Promise<string | null> {
  return serviceTypeToIdMap[serviceType.toLowerCase()] || null;
}

export async function checkAvailabilityTool(args: { serviceType: string, date: string }) {
  console.log("args ", args)
  const serviceId = await getServiceIdByType(args.serviceType);
  console.log("serviceId", serviceId);
  if (!serviceId) return { available: false, message: `Service not found: ${args.serviceType}` };
  const rawDate = new Date(args.date);
  if (isNaN(rawDate.getTime())) {
    return { available: false, message: `❗ Invalid date: ${args.date}` };
  }

   const formattedDate = rawDate.toISOString().split("T")[0];
   console.log("new Date(formattedDate)", new Date(formattedDate))
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
        const isAvailable = !anyBookingExist;

        return {
          available: isAvailable,
          message: isAvailable
            ? `✅ Yes, ${args.serviceType} is available on ${args.date}. Would you like to book it?`
            : `❌ Sorry, ${args.serviceType} is already booked on ${args.date}. Please choose another date.`,
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

  const response = await axios.post(`${process.env.API_BASE}/client/request`, {
    ...args,
    serviceId
  });

  return response.data;
}
