import { Decimal } from "@prisma/client/runtime/library";

export interface iService {
    id: string;
    serviceName: string;
    description: string | null;
    price: Decimal;
    available: boolean;
  }
  