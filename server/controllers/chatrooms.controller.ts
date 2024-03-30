import { NextFunction, Request, Response } from "express";
import {
  createRoom,
  deleteRoomById,
  getAllRooms,
  getRoomById,
  updateRoomById,
} from "../state/chatroom";
import NotFoundError from "../exceptions/notFoundError";

/**
 * Creates a new room with the provided name and description.
 * @param {Request} req - The request object containing the room information.
 * @param {Response} res - The response object for sending responses.
 * @throws {Error} Throws an error if the name or description is missing.
 */
const create = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const createdRoom = await createRoom(name, description);
  res.status(201).json({ data: createdRoom });
};

/**
 * Retrieves a room by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the room with the specified ID is not found.
 */
const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const room = await getRoomById(id);
  if (!room) {
    throw new NotFoundError(`Room not found with id: ${id}`);
  }
  res.json({ data: room });
};

/**
 * Retrieves all rooms from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object for sending responses.
 */
const getAll = async (req: Request, res: Response) => {
  const rooms = await getAllRooms();
  res.json({ data: rooms });
};

/**
 * Updates a room's information by its ID.
 * @param {Request} req - The request object containing the room ID and updated information.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the room with the specified ID is not found.
 * @throws {Error} Throws an error if the name or description is missing.
 */
const updateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name || !description) {
    throw new Error("Name and description are required");
  }
  const room = await getRoomById(id);
  if (!room) {
    throw new NotFoundError(`Room not found with id: ${id}`);
  }
  const updatedRoom = await updateRoomById(
    id,
    name || room.name,
    description || room.description
  );
  res.status(200).json({ data: updatedRoom });
};

/**
 * Deletes a room by its ID from the database.
 * @param {Request} req - The request object containing the room ID.
 * @param {Response} res - The response object for sending responses.
 * @throws {NotFoundError} Throws a NotFoundError if the room with the specified ID is not found.
 */
const deleteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const room = await getRoomById(id);
  if (!room) {
    throw new NotFoundError(`Room not found with id: ${id}`);
  }
  await deleteRoomById(id);
  res.status(200).json({ message: "Room deleted successfully" });
};

export { create, getAll, getById, updateById, deleteById };
