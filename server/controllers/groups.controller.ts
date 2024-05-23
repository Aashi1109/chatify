import {IGroups} from "@definitions/interfaces";
import ClientError from "@exceptions/clientError";
import GroupService from "@services/GroupService";
import UserGroupService from "@services/UserGroupsService";
import {Request, Response} from "express";

/**
 * Creates a new group.
 * @param {Request} req - The request object containing the group details.
 * @param {Response} res - The response object for sending responses.
 * @returns {Promise<Response>} A promise that resolves to the response object with the created group data.
 */
const createGroup = async (req: Request, res: Response): Promise<Response> => {
  const { creatorId, description, image, messages, name } = req.body as IGroups;

  // create group
  const newGroup = await GroupService.createGroup({
    creatorId,
    description,
    image,
    messages,
    name,
  });

  // create usergroup entry
  const newUserGroup = await UserGroupService.createUserGroup({
    groupId: newGroup._id,
    userId: creatorId,
  });

  return res.status(201).json({
    success: true,
    data: { group: newGroup, usergroup: newUserGroup },
  });
};

/**
 * Updates an existing group.
 * @param {Request} req - The request object containing the group ID and update details.
 * @param {Response} res - The response object for sending responses.
 * @returns {Promise<Response>} A promise that resolves to the response object with the updated group data.
 */
const updateGroup = async (req: Request, res: Response): Promise<Response> => {
  const { groupId } = req.params;

  // find the group with matching groupId
  const existingGroup = await GroupService.getGroupById(groupId);
  if (!existingGroup) {
    throw new ClientError(`Group ${groupId} does not exist`);
  }

  // update the group
  const updatedGroup = await GroupService.updateGroup(groupId, req.body);

  return res.status(200).json({
    success: true,
    data: updatedGroup,
  });
};

/**
 * Deletes an existing group.
 * @param {Request} req - The request object containing the group ID.
 * @param {Response} res - The response object for sending responses.
 * @returns {Promise<Response>} A promise that resolves to the response object with the deleted group data.
 */
const deleteGroup = async (req: Request, res: Response): Promise<Response> => {
  const { groupId } = req.params;
  const existingGroup = await GroupService.getGroupById(groupId);
  if (!existingGroup) {
    throw new ClientError(`Group ${groupId} does not exist`);
  }
  const deletedGroup = await GroupService.deleteGroup(groupId);

  return res.status(200).json({
    success: true,
    data: deletedGroup,
  });
};

/**
 * Retrieves a group by its ID.
 * @param {Request} req - The request object containing the group ID.
 * @param {Response} res - The response object for sending responses.
 * @returns {Promise<Response>} A promise that resolves to the response object with the group data.
 */

const getGroupById = async (req: Request, res: Response): Promise<Response> => {
  const { groupId } = req.params;
  const existingGroup = await GroupService.getGroupById(groupId);
  if (!existingGroup) {
    throw new ClientError(`Group ${groupId} does not exist`);
  }

  return res.status(200).json({
    success: true,
    data: existingGroup,
  });
};

/**
 * Retrieves all groups.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object for sending responses.
 * @returns {Promise<Response>} A promise that resolves to the response object with the list of all groups.
 */
const getAllGroups = async (req: Request, res: Response): Promise<Response> => {
  const groups = await UserGroupService.getAllUserGroups();

  return res.status(200).json({
    success: true,
    data: groups,
  });
};

/**
 * Retrieves groups by query parameters.
 * @param {Request} req - The request object containing query parameters.
 * @param {Response} res - The response object for sending responses.
 * @returns {Promise<Response>} A promise that resolves to the response object with the list of groups matching the query.
 * @throws {ClientError} Throws a ClientError if none of GroupId, CreatorId, or UserId are provided.
 */
const getGroupsByQuery = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  // options to configure query parameters
  let {
    limit,
    populate,
    sortBy,
    sortOrder,
    groupId,
    userId,
    creatorId,
    not,
    pageNumber,
  } = req.query;

  if (!groupId && !userId && !creatorId) {
    throw new ClientError(
      "GroupId, CreatorId, or UserId is required but nothing provided",
    );
  }

  const filter: { _id?: string; userId?: string; creatorId?: string } = {};
  if (groupId) {
    filter._id = groupId as string;
  }
  if (userId) {
    filter.userId = userId as string;
  }
  if (creatorId) {
    filter.creatorId = creatorId as string;
  }

  const userChats = await GroupService.getGroupsByFilter(
    filter,
    +limit,
    sortBy !== "createdAt" && sortBy !== "updatedAt" ? null : sortBy,
    sortOrder !== "asc" && sortOrder !== "desc" ? null : sortOrder,
    !!populate,
    null,
    +pageNumber,
    not as string,
  );

  return res.json({ success: true, data: userChats });
};

export {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroupById,
  getGroupsByQuery,
  updateGroup,
};
