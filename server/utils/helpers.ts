import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

import { IUser } from "../definitions/interfaces";
import config from "../config";
import { UserRoles } from "../definitions/enums";

/**
 * Generates a safe copy of a user object by removing sensitive information.
 * @function generateUserSafeCopy
 * @param {IUser | any} user - The user object to generate a safe copy from.
 * @returns {IUser} A safe copy of the user object without the password field.
 */
const generateUserSafeCopy = (user: IUser | any): IUser => {
  // Create a shallow copy of the user object
  const _user = { ...user };

  // Delete the password field from the copied user object
  delete _user.password;

  // Delete the salt field from user object
  delete _user.salt;

  // Return the safe copy of the user object
  return _user;
};

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<{[string:string]}>} A Promise that resolves with the hashed password.
 * @throws {Error} Throws an error if hashing fails.
 */
const hashPassword = async (
  password: string
): Promise<{ hashedPassword: string; salt: string }> => {
  try {
    const salt = await bcrypt.genSalt(config.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return { hashedPassword, salt };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to hash password");
  }
};

/**
 * Generates an access token for the given user.
 * @param {IUser} user - The user for whom the access token is generated.
 * @returns {Promise<string>} A Promise that resolves with the generated access token.
 * @throws {Error} Throws an error if token generation fails.
 */
const generateAccessToken = async (user) => {
  try {
    const payload = { username: user.username, role: user.role, id: user._id };
    return jwt.sign(payload, config.jwt.secret, { expiresIn: "30d" });
  } catch (error) {
    throw new Error("Failed to generate access token");
  }
};

/**
 * Validates a password by comparing it with its hashed counterpart.
 * @param {string} originalPassword - The original (hashed) password to compare against.
 * @param {string} comparePassword - The password to compare.
 * @returns {Promise<boolean>} A Promise that resolves with a boolean indicating whether the passwords match.
 * @throws {Error} Throws an error if the comparison fails.
 */
const validatePassword = async (originalPassword, comparePassword) => {
  try {
    return await bcrypt.compare(comparePassword, originalPassword);
  } catch (error) {
    throw new Error("Failed to validate password");
  }
};

/**
 * Parses a string representation of a user role and returns the corresponding enum value.
 * @param {string} role - The string representation of the user role.
 * @returns {UserRoles | undefined} The corresponding enum value if found, otherwise undefined.
 */
function parseUserRole(role: string): UserRoles | undefined {
  const roleKeys = Object.keys(UserRoles) as (keyof typeof UserRoles)[];
  const foundRole = roleKeys.find((key) => UserRoles[key] === role);
  return foundRole ? UserRoles[foundRole] : undefined;
}

export {
  generateUserSafeCopy,
  hashPassword,
  generateAccessToken,
  validatePassword,
  parseUserRole,
};
