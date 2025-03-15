export interface iUserDTO {
    id: string; // Google ID
    email: string;
    name: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    verified_email?: boolean;
    phone?: string;
    password?: string;
  }
  