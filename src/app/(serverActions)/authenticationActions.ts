// https://nextjs.org/docs/app/building-your-application/authentication#authentication

"use server";

import { connectToMongo } from "../(utils)/mongoDBClient";
import { SessionInterface, UserInterface } from "../(utils)/TSInterface";
import bcrypt from "bcrypt";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export const encrypt = async (payload: JWTPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
};

export const decrypt = async (session: string | undefined = "") => {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload.sessionId;
  } catch (error) {
    console.log("Failed to verify session");
    return null;
  }
};

// CREATE A SESSION AND SET IN THE BROWSER ALSO SAVE IN THE DATABASE
export const createSession = async (userId: string) => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const taskDB = await connectToMongo();
    if (taskDB) {
      const sessionCollection = taskDB.collection<SessionInterface>("session");

      // 1. Create a session in the database
      const sessionData = await sessionCollection.findOneAndUpdate(
        { userId },
        { $set: { userId, expiresAt } },
        { upsert: true, returnDocument: "after" }
      );

      const sessionId = sessionData?._id;

      // 2. Encrypt the session ID
      const session = await encrypt({ sessionId, expiresAt });

      // 3. Store the session in cookies for optimistic auth checks
      cookies().set("session", session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
      });

      return { done: true };
    }
  } catch (e) {
    console.log("The error", e);
  }

  return { done: false };

  // revalidatePath("/dashboard"); // Update cached posts
  // redirect(`/dashboard`); // Navigate to the new post page
};

// Extend the session's expiration time. This is useful for keeping the user logged in after they access the application again.
export const GetAndUpdateSession = async () => {
  try {
    const session = cookies().get("session")?.value;

    if (!session) return null;

    const sessionID = await decrypt(session);

    if (!sessionID) return null;

    // The sessionID can be used to get the userID.
    const taskDB = await connectToMongo();

    if (taskDB) {
      const sessionCollection = taskDB.collection<SessionInterface>("session");

      const theSession = await sessionCollection.findOne({
        _id: new ObjectId(sessionID as string),
      });

      // Return the session, which will contain the user's ID
      return theSession;

      // OPTIONALLY, WE CAN UPDATE THE USER'S SESSION EXPIRY TIME

      // const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // cookies().set("session", session, {
      //   httpOnly: true,
      //   secure: true,
      //   expires: expires,
      //   sameSite: "lax",
      //   path: "/",
      // });
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getUser = async () => {
  try {
    // Get the session
    const userID = await GetAndUpdateSession();

    const taskDB = await connectToMongo();
    if (taskDB && userID) {
      const usersCollection = taskDB.collection<UserInterface>("users");

      const user = await usersCollection.findOne(
        { _id: new ObjectId(userID.userId) },
        { projection: { password: 0 } }
      );

      if (user) return { email: user.email, _id: user._id.toString() };

      return null;
    }
  } catch (e) {
    console.log(e);
  }

  return null;
};

export const deleteSession = async () => {
  // 1. Get the session
  const session = cookies().get("session")?.value;

  // 2. Then delete it from the browser's cookie
  cookies().delete("session");

  if (!session) return null;

  // 3. Delete the session from the database
  const sessionID = await decrypt(session);

  const taskDB = await connectToMongo();

  if (taskDB) {
    const sessionCollection = taskDB.collection<SessionInterface>("session");

    await sessionCollection.deleteOne({
      _id: new ObjectId(sessionID as string),
    });
  }
};

export const signUpUser = async (formData: FormData) => {
  try {
    if (formData) {
      let email = formData.get("email") as string;
      let password = formData.get("password") as string;
      let confirmPassword = formData.get("confirmPassword") as string;

      email = email.trim();
      password = password.trim();
      confirmPassword = confirmPassword.trim();

      const taskDB = await connectToMongo();

      if (taskDB && email && password && password === confirmPassword) {
        const userCollection = taskDB.collection<UserInterface>("users");

        const hashPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

        const result = await userCollection.findOneAndUpdate(
          { email },
          {
            $set: {
              email,
              password: hashPassword,
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        if (result?._id) {
          // Convert the object ID to string, else Next JS will throw an error that classes are not allowed to be sent to the client (because result.insertedId is a class i.e new ObjectId())
          const sessionCreated = await createSession(result._id.toString());

          if (sessionCreated.done) {
            return { done: true };
          }
        }
      }

      throw new Error("Something went wrong");
    }
  } catch (e) {
    console.log(e);
    return { done: false };
  }

  return { done: false };

  // Redirect user
  // Internally, redirect throws an error so it should be called outside of try/catch blocks.
  // revalidatePath("/dashboard"); // Update cached posts
  // redirect(`/dashboard`); // Navigate to the new post page
};

export const loginUser = async (formData: FormData) => {
  try {
    if (formData) {
      let email = formData.get("email") as string;
      let password = formData.get("password") as string;

      email = email.trim();
      password = password.trim();

      const taskDB = await connectToMongo();

      if (taskDB && email && password) {
        const userCollection = taskDB.collection<UserInterface>("users");

        const user = await userCollection.findOne({ email });

        if (user && user.password) {
          const passwordMatched = await bcrypt.compare(password, user.password);

          if (passwordMatched) {
            // Convert the object ID to string, else Next JS will throw an error that classes are not allowed to be sent to the client (because result.insertedId is a class i.e new ObjectId())
            const sessionCreated = await createSession(user._id.toString());

            if (sessionCreated.done) {
              return { done: true };
            }
          }
        }
      }

      throw new Error("Something went wrong");
    }
  } catch (e) {
    console.log(e);
    return { done: false };
  }

  return { done: false };
};
