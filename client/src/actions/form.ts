"use server";

import axiosClient from "@/common/service/axios-client";
import { EConversationTypes } from "@/definitions/enums";
import {
  IConversation,
  IFile,
  IFileInterface,
  IUser,
} from "@/definitions/interfaces";

const checkUsernameExists = async (username: string) => {
  const requestUrl = `/users/query?username=` + username;
  try {
    const response = await axiosClient.get(requestUrl);
    const data = response.data;

    if (data?.data?.length) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return true;
  }
};

const loginUser = async (
  username: string,
  password: string,
  rememberUser: boolean
) => {
  const requestUrl = `/auth/login`;
  try {
    const response = await axiosClient.post(requestUrl, {
      username,
      password,
      rememberUser,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in user : ", error);
    throw error;
  }
};

const uploadFile = async (
  fileData: IFileInterface
): Promise<{ data: IFile; success: boolean }> => {
  const requestUrl = `/files/upload`;
  try {
    const modifiedData = { ...fileData, uploadTo: "cloudinary" };
    delete modifiedData.file;
    const response = await axiosClient.post(requestUrl, modifiedData);
    return response.data;
  } catch (error) {
    console.error("Error uploading file : ", error);
    throw error;
  }
};

const createUser = async (
  username: string,
  name: string,
  password: string,
  confirmPassword: string,
  profileImage: object,
  about: string,
  role: string
) => {
  const requestUrl = `/users`;

  try {
    const response = await axiosClient.post(requestUrl, {
      username,
      name,
      confirmPassword,
      password,
      profileImage,
      about,
      role,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user : ", error);
    throw error;
  }
};

const updateUser = async (userId: string, data: any) => {
  const requestUrl = `/users/${userId}`;
  try {
    const response = await axiosClient.patch(requestUrl, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user : ", error);
    throw error;
  }
};

const getUserData = async (userId: string): Promise<IUser | null> => {
  const requestUrl = `/users/${userId}`;

  try {
    const response = await axiosClient.get(requestUrl);
    return response.data;
  } catch (error) {
    console.error("Error getting user data : ", error);
    throw error;
  }
};

const getUserConversations = async ({
  participants,
  conversationId,
  query,
  type,
}: {
  participants: string[];
  type?: EConversationTypes;
  conversationId?: string;
  query?: string;
}) => {
  const requestUrl = `/conversations/query?populate=true${query ?? ""}`;

  try {
    const response = await axiosClient.post(requestUrl, {
      participants,
      conversationId,
      type,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error getting user conversations : ", error);
    const errorMessage = error?.response?.data?.error;
    throw errorMessage;
  }
};

const getAllUser = async (not?: null | string) => {
  const requestUrl = `/users/query?not=${not}`;
  try {
    const response = await axiosClient.get(requestUrl);
    return response.data;
  } catch (error) {
    console.error("Error getting all users : ", error);
    throw error;
  }
};

const createConversation = async ({
  participants,
  type,
  image,
  name,
  description,
  creator,
}: IConversation): Promise<object | any> => {
  const requestUrl = `/conversations`;
  try {
    const response = await axiosClient.post(requestUrl, {
      participants,
      type,
      image,
      name,
      description,
      creator,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting chats : ", error);
    throw error;
  }
};

const getConversationById = async (conversationId: string) => {
  const requestUrl = `/conversations/${conversationId}`;
  try {
    const response = await axiosClient.get(requestUrl);
    return response.data;
  } catch (error) {
    console.error("Error getting chats : ", error);
    throw error;
  }
};

const getMessagesByQuery = async (conversationId: string, params: any) => {
  try {
    // Convert params to query string
    const queryString = new URLSearchParams(params).toString();
    const requestUrl = `/conversations/${conversationId}/messages/query?${queryString}`;
    const response = await axiosClient.get(requestUrl);
    return response.data;
  } catch (error) {
    console.error("Error getting messages : ", error);
    throw error;
  }
};

export const getSessionOfUser = async () => {
  try {
    const response = await axiosClient.get("/auth/session");
    return response.data;
  } catch (error) {
    console.error("Error getting session of user: ", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosClient.get("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error logging out user: ", error);
    throw error;
  }
};

export {
  updateUser,
  checkUsernameExists,
  createConversation,
  createUser,
  getAllUser,
  getConversationById,
  getUserConversations,
  getUserData,
  loginUser,
  uploadFile,
  getMessagesByQuery,
};
