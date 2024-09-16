import { ObjectId } from "mongodb";

export interface UserInterface {
  _id?: string | ObjectId;
  email: string;
  password?: string;
}

// We used type, as Tanstack documentation suggested
export type TaskType = {
  _id?: string | ObjectId;
  task: string;
  priority: "low" | "medium" | "high";
  status: "inprogress" | "completed";
  owner: string;
  dateAdded?: Date;
};

export interface SessionInterface {
  _id: string | ObjectId;
  userId: string | ObjectId;
  expiresAt: Date;
}
