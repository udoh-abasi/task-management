"use server";

import { ObjectId } from "mongodb";
import { connectToMongo } from "../(utils)/mongoDBClient";
import { TaskType, UserInterface } from "../(utils)/TSInterface";

export const addTask = async (
  userID: string,
  task: string,
  priority: TaskType["priority"]
) => {
  try {
    // Check if this is a valid user making the request
    const taskDB = await connectToMongo();
    if (taskDB) {
      const usersCollection = taskDB.collection<UserInterface>("users");

      const user = await usersCollection.findOne(
        { _id: new ObjectId(userID) },
        { projection: { password: 0 } }
      );

      if (user) {
        const taskCollection = taskDB.collection<TaskType>("tasks");

        const now = new Date();

        const addedTask = await taskCollection.insertOne({
          owner: user._id.toString(),
          task,
          priority,
          status: "inprogress",
          dateAdded: now,
        });

        if (addedTask.insertedId) {
          return {
            user: user._id.toString(),

            addedTask: {
              _id: addedTask.insertedId.toString(),
              owner: user._id.toString(),
              task,
              priority,
              status: "inprogress" as TaskType["status"],
              dateAdded: now,
            },
          };
        } else {
          return { user: user._id.toString(), addedTask: null };
        }
      } else {
        return { user: null, addedTask: null };
      }
    }
  } catch (e) {
    console.log(e);
    return { user: null, addedTask: null };
  }
};

export const getAllTask = async (userID: string) => {
  try {
    const taskDB = await connectToMongo();

    if (taskDB) {
      const taskCollection = taskDB.collection<TaskType>("tasks");
      const allTask = await taskCollection
        .find({ owner: userID })
        .sort("dateAdded", -1)
        .toArray();

      return allTask.map((eachTask) => {
        return {
          ...eachTask,
          _id: eachTask._id.toString(),
        };
      });
    }

    return [];
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const markTaskAsComplete = async (taskID: string, owner: string) => {
  try {
    const taskDB = await connectToMongo();

    if (taskDB && taskID) {
      const taskCollection = taskDB.collection<TaskType>("tasks");

      // Make sure the owner is the one that sent the request to mark the task as completed
      // So, we search for a match for both the owner's ID and task's ID
      await taskCollection.updateOne(
        { _id: new ObjectId(taskID), owner },
        { $set: { status: "completed" } }
      );
    }
  } catch (e) {
    console.log(e);
  }
};

export const deleteTask = async (taskID: string, owner: string) => {
  try {
    const taskDB = await connectToMongo();

    if (taskDB && taskID) {
      const taskCollection = taskDB.collection<TaskType>("tasks");

      // Make sure the owner is the one that sent the request to mark the task as completed
      // So, we search for a match for both the owner's ID and task's ID

      await taskCollection.deleteOne({ _id: new ObjectId(taskID), owner });
    }
  } catch (e) {
    console.log(e);
  }
};
