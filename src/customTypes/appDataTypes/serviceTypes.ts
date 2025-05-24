import { Decimal } from "@prisma/client/runtime/library";

export interface iService {
    id: string;
    serviceName: string;
    description: string | null;
    price: Decimal;
    available: boolean;
}

export interface iCreateServiceDTO {
    serviceName: string;
    description?: string;
    price: number;
    available: boolean;
    userId: string;
}

export interface iUpdateServiceDTO {
    serviceName?: string;
    description?: string;
    price?: number;
    available?: boolean;
    userId: string;
}
  