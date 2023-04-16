import { User } from "./user";

export interface Events {
    id?: string;
    eventName: string
    amount: number;
    paidBy: User
    eventMembers: Array<User>
    date: Date
    // splitType: string
}
