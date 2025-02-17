import { randomUUID } from 'crypto';

function generateUUID(): string {
        const uuid = randomUUID();
        return uuid;
}
    
    export default {generateUUID};