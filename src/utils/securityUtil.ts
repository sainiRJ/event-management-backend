import { randomUUID } from 'crypto';
import bcrypt from "bcrypt";

function generateUUID(): string {
        const uuid = randomUUID();
        return uuid;
}

async function hashPassword(password: string): Promise<string> {
        // Implement your own password hashing logic here
        // For example, you can use a library like bcrypt or Argon2
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }
    
export default {generateUUID, hashPassword};