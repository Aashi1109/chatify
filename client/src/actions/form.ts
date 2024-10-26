"use server";

import config from "@/config";
import { IFileInterface, IGroups, IUser } from "@/definitions/interfaces";
import { createUrlWithQueryParams } from "@/lib/helpers/generalHelper";
import axios from "axios";

const checkUsernameExists = async (username: string) => {
  const requestUrl = `${config.apiURL}users/query?username=` + username;
  try {
    const response = await fetch(requestUrl);
    const data = await response.json();

    if (data?.data?.username) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return true;
  }
};

const loginUser = async (username: string, password: string) => {
  const requestUrl = `${config.apiURL}auth/login`;
  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      body: JSON.stringify({ username: username, password: password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error logging in user : ", error);
    throw error;
  }
};

const uploadFile = async (fileData: IFileInterface) => {
  const requestUrl = `${config.apiURL}files/upload`;
  try {
    const modifiedData = { ...fileData, uploadTo: "cloudinary" };
    delete modifiedData.file;
    const response = await fetch(requestUrl, {
      method: "POST",
      body: JSON.stringify(modifiedData),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data;
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
  role: string,
) => {
  const requestUrl = `${config.apiURL}users`;

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      body: JSON.stringify({
        username,
        name,
        confirmPassword,
        password,
        profileImage,
        about,
        role,
      }),
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating user : ", error);
    throw error;
  }
};

const getUserData = async (
  token: string,
  userId: string,
): Promise<IUser | null> => {
  const requestUrl = `${config.apiURL}users/${userId}`;

  try {
    const response = await axios(requestUrl, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = response.data;
    return data?.data;
  } catch (error) {
    console.error("Error getting user data : ", error);
    throw error;
  }
};

const getUserChats = async (token: string, userId: string) => {
  const requestUrl = `${config.apiURL}chats/query?userId=${userId}&populate=true`;

  try {
    const response = await axios(requestUrl, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error getting user chats : ", error);
    throw error;
  }
};

const getUserChatData = async (
  token: string,
  chatId: string,
  options: {
    populate?: boolean;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
  } = {},
) => {
  const requestUrl = `${config.apiURL}chats/${chatId}`;

  const modifiedUrl = createUrlWithQueryParams(requestUrl, options);
  try {
    const response = await axios(modifiedUrl, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error getting user chats : ", error);
    throw error;
  }
};

const getAllUser = async (token: string, not?: null | string) => {
  const requestUrl = `${config.apiURL}users/query?not=${not}`;
  try {
    const response = await axios(requestUrl, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error getting all users : ", error);
    throw error;
  }
};

const getChatDataByInteraction = async (
  token: string,
  userId: string,
  receiverId: string,
) => {
  const requestUrl = `${config.apiURL}chats/interaction/${userId}/${receiverId}`;
  try {
    const response = await axios(requestUrl, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error getting chats : ", error);
    throw error;
  }
};

const createChatData = async (
  token: string,
  userId: string,
  receiverId: string,
): Promise<object | any> => {
  const requestUrl = `${config.apiURL}chats/create`;
  try {
    const response = await axios(requestUrl, {
      method: "POST",
      data: { receiverId, userId },
      headers: { Authorization: "Bearer " + token },
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error getting chats : ", error);
    throw error;
  }
};

const getChatDataById = async (token: string, chatId: string) => {
  const requestUrl = `${config.apiURL}chats/${chatId}`;
  try {
    const response = await axios(requestUrl, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error getting chats : ", error);
    throw error;
  }
};

const createGroup = async (token: string, groupData: IGroups) => {
  const requestUrl = `${config.apiURL}groups/create`;
  try {
    const response = await axios(requestUrl, {
      method: "POST",
      data: groupData,
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating group : ", error);
    throw error;
  }
};

const getMessagesByQuery = async (token: string, params: any) => {
  try {
    // Convert params to query string
    const queryString = new URLSearchParams(params).toString();
    const requestUrl = `${config.apiURL}messages/query?${queryString}`;
    const response = await axios(requestUrl, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting messages : ", error);
    throw error;
  }
};

const createMessage = async (
  token: string,
  data: {
    content: string;
    chatId: string;
    userId: string;
    sentAt: Date;
    groupId?: string;
  },
) => {
  const requestUrl = `${config.apiURL}messages`;
  try {
    const response = await axios(requestUrl, {
      method: "POST",
      data: data,
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating message : ", error);
    throw error;
  }
};
export {
  checkUsernameExists,
  createChatData,
  createGroup,
  createUser,
  getAllUser,
  getChatDataById,
  getChatDataByInteraction,
  getUserChatData,
  getUserChats,
  getUserData,
  loginUser,
  uploadFile,
  getMessagesByQuery,
  createMessage,
};
