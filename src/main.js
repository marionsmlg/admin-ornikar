import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
});

// UserSchema.parse({ username: "Ludwig" });

// extract the inferred type
// type User = z.infer<typeof UserSchema>;
// { username: string }
const user = {
  email: "marion.schimmerling@hotmail.fr",
  password: "marion",
  confirmPassword: "marion",
};
console.log(UserSchema.parse(user));
