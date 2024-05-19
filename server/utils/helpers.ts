import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import config from "@config";
import {EUserRoles} from "@definitions/enums";
import {IUser} from "@definitions/interfaces";

import {FlattenMaps, Model, Require_id} from "mongoose";

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
  password: string,
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
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
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
 * @returns {EUserRoles | undefined} The corresponding enum value if found, otherwise undefined.
 */
function parseUserRole(role: string): EUserRoles | undefined {
  const roleKeys = Object.keys(EUserRoles) as (keyof typeof EUserRoles)[];
  const foundRole = roleKeys.find((key) => EUserRoles[key] === role);
  return foundRole ? EUserRoles[foundRole] : undefined;
}

/**
 * Queries a particular model based on different params passed to it
 * @template T - Type of the document in the model
 * @param {Model<T>} model - The mongoose model to use for query
 * @returns {Function} A function that takes filter criteria and returns a promise
 */
const getByFilter =
  <T>(model: Model<T>): Function =>
  async (
    /**
     * @inner
     * @param {Object} filter - The filter object to query documents.
     * @param {Partial<Record<keyof T, any>>} filter - Optional dynamic fields to filter by.
     * @param {string[]} populateFields - Array of fields to populate.
     * @param {number} [limit] - Optional limit for the number of documents to return.
     * @param {keyof T} [sortBy] - Optional field to sort by.
     * @param {"asc"|"desc"} [sortOrder] - Optional order to sort (ascending or descending).
     * @param {boolean} [doPopulate=true] - Whether to populate the specified fields.
     * @param {number} [pageNumber=1] - Optional page number for pagination.
     * @returns {Promise<Require_id<FlattenMaps<T>>[]>} - A promise that resolves to an array of documents matching the query.
     */
    filter: Partial<Record<keyof T, any>>,
    populateFields: string[],
    limit?: number,
    sortBy?: "createdAt" | "updatedAt",
    sortOrder?: "asc" | "desc",
    doPopulate = true,
    pageNumber?: number,
  ): Promise<Require_id<FlattenMaps<T>>[]> => {
    try {
      pageNumber ??= 1;
      const skip = limit ? (pageNumber - 1) * limit : 0;

      let query = model.find(filter);

      if (sortBy && sortOrder) {
        query.sort({ [sortBy]: sortOrder });
      }

      if (limit) {
        query.limit(limit).skip(skip);
      }

      if (doPopulate && populateFields.length > 0) {
        populateFields.forEach((field) => {
          query.populate(field);
        });
      }

      return await query.lean().exec();
    } catch (error) {
      console.error(`Error fetching ${model.modelName}:`, error);
      throw error;
    }
  };

export {
  generateAccessToken,
  generateUserSafeCopy,
  getByFilter,
  hashPassword,
  parseUserRole,
  validatePassword,
};
