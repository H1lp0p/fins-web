export type MessageType = "info" | "success" | "error";

export interface Message {
    type: MessageType;
    title: string;
    text: string;
}