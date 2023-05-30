import argon2 from "argon2";
import { z } from "zod";
import { fetchDataFromTable } from "../utils-database.js";
import db from "../utils-database.js";

export async function identifiersAreValid(inputIdentifiers) {
  const arrOfUsers = await fetchDataFromTable("user");
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
    const trx = await db.transaction();
    try {
      await trx("user")
        .where({ email: inputIdentifiers.email })
        .update({ session_id: sessionId });
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
    }
  },
  remove: async function removeSessionId(sessionId) {
    const trx = await db.transaction();
    try {
      await trx("user")
        .where({ session_id: sessionId })
        .update({ session_id: null });
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
    }
  },
};

export async function hasSessionId(sessionId) {
  if (sessionId) {
    const users = await fetchDataFromTable("user");
    const user = users.find((user) => user.session_id === sessionId);
    return Boolean(user);
  } else {
    return false;
  }
}

export const user = {
  getEmail: async function (sessionId) {
    if (sessionId) {
      const users = await fetchDataFromTable("user");
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
      const users = await fetchDataFromTable("user");
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
    const trx = await db.transaction();
    try {
      await trx("user").insert(form);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
    }
  },
};

export async function userExists(dataToAdd) {
  const users = await fetchDataFromTable("user");
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
