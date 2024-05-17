import { IGroups } from "@definitions/interfaces";
import ClientError from "@exceptions/clientError";
import GroupService from "@services/GroupService";
import UserGroupService from "@services/UserGroupsService";
import { Request, Response } from "express";

const createGroup = async (req: Request, res: Response) => {
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

  res.status(201).json({
    success: true,
    data: { group: newGroup, usergroup: newUserGroup },
  });
};

const updateGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  // find the group with matching groupId
  const existingGroup = await GroupService.getGroupById(groupId);
  if (!existingGroup) {
    throw new ClientError(`Group ${groupId} does not exist`);
  }

  // update the group
  const updatedGroup = await GroupService.updateGroup(groupId, req.body);
  res.status(200).json({
    success: true,
    data: updatedGroup,
  });
};

const deleteGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const existingGroup = await GroupService.getGroupById(groupId);
  if (!existingGroup) {
    throw new ClientError(`Group ${groupId} does not exist`);
  }
  const deletedGroup = await GroupService.deleteGroup(groupId);
  res.status(200).json({
    success: true,
    data: deletedGroup,
  });
};

const getGroupById = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const existingGroup = await GroupService.getGroupById(groupId);
  if (!existingGroup) {
    throw new ClientError(`Group ${groupId} does not exist`);
  }
  res.status(200).json({
    success: true,
    data: existingGroup,
  });
};

const getAllGroups = async (req: Request, res: Response) => {
  const groups = await UserGroupService.getAllUserGroups();
  res.status(200).json({
    success: true,
    data: groups,
  });
};

/**
 * Retrieves a chat by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the chat with the specified ID is not found.
 */
const getGroupsByQuery = async (req: Request, res: Response) => {
  // options to configure query parameters
  let {
    limit,
    populate,
    sortBy,
    sortOrder,
    groupId,
    userId,
    creatorId,
    notId,
  } = req.query;

  if (!groupId && !userId && !creatorId) {
    throw new ClientError(
      "GroupId, CreatorId, or UserId is required but nothing provided"
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
    !!populate
  );

  res.json({ success: true, data: userChats });
};

export {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroupById,
  getGroupsByQuery,
  updateGroup,
};
