import { User } from "./user";

export interface Events {
    id?: string | null | undefined;
    eventName: string | null | undefined
    amount: number 
    paidBy: string | null | undefined
    eventMembers: Array<User>
    date: string
    splitMoney: string
    // splitType: string
}
