import argon2 from "argon2";
import { z } from "zod";
import db from "../utils-database.js";

export async function identifiersAreValid(inputIdentifiers) {
  const arrOfUsers = await db("user").select("*");
  const user = arrOfUsers.find((user) => user.email === inputIdentifiers.email);
  if (!user) {
    return false;
  } else if (
    user.email === inputIdentifiers.email &&
    (await argon2.verify(user.password, inputIdentifiers.password))
  ) {
    return true;
  } else {
    return false;
  }
}

export const sessionId = {
  add: async function (inputIdentifiers, sessionId) {
    await db("user")
      .where({ email: inputIdentifiers.email })
      .update({ session_id: sessionId });
  },
  remove: async function (sessionId) {
    await db("user")
      .where({ session_id: sessionId })
      .update({ session_id: null });
  },
};

export async function hasSessionId(sessionId) {
  if (sessionId) {
    const users = await db("user").select("*");
    const user = users.find((user) => user.session_id === sessionId);
    return Boolean(user);
  } else {
    return false;
  }
}

export const user = {
  getEmail: async function (sessionId) {
    if (sessionId) {
      const users = await db("user").select("*");
      const user = users.find((user) => user.session_id === sessionId);
      if (user === undefined) {
        return "";
      } else {
        return user.email;
      }
    }
  },

  getId: async function (sessionId) {
    if (sessionId) {
      const users = await db("user").select("*");
      const user = users.find((user) => user.session_id === sessionId);
      if (user === undefined) {
        return "";
      } else {
        return user.id;
      }
    }
  },

  add: async function (form) {
    form.password = await argon2.hash(form.password);
    await db("user").insert(form);
  },
};

export async function userExists(dataToAdd) {
  const users = await db("user").select("*");
  const user = users.find((user) => user.email === dataToAdd.email);
  return Boolean(user);
}

export function dataUserAreValid(user) {
  const UserSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(100)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/),
    confirmPassword: z
      .string()
      .min(8)
      .max(100)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/),
  });
  return UserSchema.safeParse(user).success;
}
