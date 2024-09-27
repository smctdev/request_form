// types.ts
export type UserId = string;

export interface UserContextType {
  userId: UserId;
  updateUser: (newUserId: UserId) => void;
}
declare module 'number-to-words' {
  export function toWords(number: number): string;
}