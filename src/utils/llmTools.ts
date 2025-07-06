export const llmTools = [
  {
    name: "checkAvailability",
    description: "Check if a decoration service is available on a specific date.",
    parameters: {
      type: "object",
      properties: {
        serviceType: { type: "string", description: "e.g., stage decoration, haldi, car, mandap" },
        date: { type: "string", format: "date", description: "Date like 2025-07-25" },
      },
      required: ["serviceType", "date"]
    }
  },
  {
    name: "createBooking",
    description: "Create a new booking request for the user.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Customer name" },
        phoneNumber: { type: "string", description: "Customer mobile" },
        email: { type: "string", description: "Customer email" },
        serviceType: { type: "string", description: "e.g., stage decoration" },
        date: { type: "string", format: "date", description: "Date of event" },
        location: { type: "string", description: "Where the decoration is needed" },
        notes: { type: "string", description: "Any additional notes" },
      },
      required: ["name", "phoneNumber", "serviceType", "date", "location"]
    }
  }
];
