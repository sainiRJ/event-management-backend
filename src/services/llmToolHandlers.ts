import axios from "axios";

// map serviceType string to your internal serviceId
const serviceTypeToIdMap: Record<string, string> = {
  "stage decoration": "svc-stage-001",
  "haldi decoration": "svc-haldi-001",
  "mandap": "svc-mandap-001",
  "car decoration": "svc-car-001"
};

async function getServiceIdByType(serviceType: string): Promise<string | null> {
  return serviceTypeToIdMap[serviceType.toLowerCase()] || null;
}

export async function checkAvailabilityTool(args: { serviceType: string, date: string }) {
  const serviceId = await getServiceIdByType(args.serviceType);
  if (!serviceId) return { available: false, message: `Service not found: ${args.serviceType}` };

  const response = await axios.post(`${process.env.API_BASE}/client/available/request`, {
    serviceId,
    date: args.date
  });

  return response.data;
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
