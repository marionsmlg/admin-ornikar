import { readJSON, writeJSON } from "../utils.js";
import { customAlphabet } from "nanoid";
import argon2 from "argon2";
import { z } from "zod";
const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);

const ARTICLES_DATA_PATH = "src/data/articles.json";
const USERS_DATA_PATH = "src/data/users.json";

export async function identifiersAreValid(inputIdentifiers) {
  const arrOfUsers = await readJSON(USERS_DATA_PATH);
  const user = arrOfUsers.find((user) => user.email === inputIdentifiers.email);
  if (user === undefined) {
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

export async function getSessionId(inputIdentifiers) {
  const arrOfUsers = await readJSON(USERS_DATA_PATH);
  const user = arrOfUsers.find((user) => user.email === inputIdentifiers.email);
  const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 20);
  const sessionId = (user.sessionId = nanoid());
  await writeJSON(USERS_DATA_PATH, arrOfUsers);
  return sessionId;
}

export async function removeSessionId(sessionId) {
  const arrOfUsers = await readJSON(USERS_DATA_PATH);
  const user = arrOfUsers.find((user) => user.sessionId === sessionId);
  delete user.sessionId;
  await writeJSON(USERS_DATA_PATH, arrOfUsers);
  return arrOfUsers;
}

export async function hasSessionId(sessionId) {
  if (sessionId) {
    const users = await readJSON(USERS_DATA_PATH);
    return !!users.find((user) => user.sessionId === sessionId);
  } else {
    return false;
  }
}
export async function getUserEmail(sessionId) {
  if (sessionId) {
    const users = await readJSON(USERS_DATA_PATH);
    const user = users.find((user) => user.sessionId === sessionId);
    if (user === undefined) {
      return "";
    } else {
      return user.email;
    }
  }
}
export async function getUserId(sessionId) {
  if (sessionId) {
    const users = await readJSON(USERS_DATA_PATH);
    const user = users.find((user) => user.sessionId === sessionId);
    if (user === undefined) {
      return "";
    } else {
      return user.id;
    }
  }
}

export async function addNewUser(dataToAdd) {
  delete dataToAdd.confirmPassword;
  const data = await readJSON("src/data/users.json");
  dataToAdd.id = nanoid();
  dataToAdd.password = await argon2.hash(dataToAdd.password);
  dataToAdd.createdAt = new Date().toISOString();
  data.unshift(dataToAdd);
  await writeJSON("src/data/users.json", data);
  return data;
}

export async function userExists(dataToAdd) {
  const users = await readJSON("src/data/users.json");
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
