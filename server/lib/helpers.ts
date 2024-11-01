import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import config from "@config";
import { EUserRoles } from "@definitions/enums";
import {
  IObjectKeys,
  IPagination,
  IUser,
  IUserRequest,
} from "@definitions/interfaces";

import { FlattenMaps, Model, Require_id } from "mongoose";
import { UnauthorizedError } from "@exceptions";

/**
 * Generates a safe copy of a user object by removing sensitive information.
 * @function generateUserSafeCopy
 * @param {IUser | any} user - The user object to generate a safe copy from.
 * @returns {IUser} A safe copy of the user object without the password field.
 */
const generateUserSafeCopy = (user: IUser | any): IUser => {
  // Create a shallow copy of the user object
  const _user = { ...user };

  delete _user.password;
  delete _user.salt;

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
const generateAccessToken = async (user: IUser): Promise<string> => {
  try {
    const payload = { username: user.username, role: user.role, _id: user._id };
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
const validatePassword = async (
  originalPassword: string,
  comparePassword: string
): Promise<boolean> => {
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
     * @param {string[]} pagination - Object for pagination
     * @param {string} [not] - Optional page number for pagination.
     * @param {object} [$where] - Extra filer object to include in query.
     * @returns {Promise<Require_id<FlattenMaps<T>>[]>} - A promise that resolves to an array of documents matching the query.
     */
    filter: Partial<Record<keyof T, any>>,
    pagination: IPagination,
    not?: string,
    $where?: IObjectKeys
  ): Promise<Require_id<FlattenMaps<T>>[]> => {
    try {
      let {
        pageNumber,
        limit,
        sortBy,
        sortOrder,
        populateFields,
        doPopulate,
        startDate,
        endDate,
      } = pagination || {};

      const skip = limit ? (pageNumber - 1) * limit : 0;

      if (startDate || endDate) {
        $where = {};
        $where.createdAt = {};
      }
      if (startDate) $where.createdAt.$gte = startDate;
      if (endDate) $where.createdAt.$lte = endDate;

      if ($where) filter = { ...filter, ...$where };

      let query = model.find(filter);

      if (not) {
        // @ts-ignore
        query = query.find({ _id: { $ne: not } });
      }

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

const validateJwtTokenId = (req: IUserRequest, id: string) => {
  // validate if id and token being used is for the same user
  console.log("req.user", req.user);
  if (req.user && req.user._id?.toString() !== id) {
    throw new UnauthorizedError(
      "Invalid token provided",
      "Token maybe valid but does not match with the user id provided"
    );
  }
};

export const getJWTPayload = async (rawToken: string) => {
  const jwtPayload = <any>(
    jwt.verify(rawToken?.split(" ")[0], config.jwt.secret, { complete: true })
  );

  return jwtPayload.payload;
};

export const createFilterFromParams = (params: IObjectKeys): IObjectKeys => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {} as IObjectKeys);
};

export const updateArrayField = (
  existingArray: any[],
  newItems: any[],
  operation: "add" | "delete"
) => {
  if (operation === "add") {
    existingArray.push(...newItems);
  } else if (operation === "delete") {
    return existingArray.filter((item) => !newItems.includes(item));
  }
  return existingArray;
};

export {
  generateAccessToken,
  validateJwtTokenId,
  generateUserSafeCopy,
  getByFilter,
  hashPassword,
  parseUserRole,
  validatePassword,
};
