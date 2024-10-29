import connectDB from "@database/connectDB";
import { faker } from "@faker-js/faker";
import Message from "@models/Message";
import User from "@models/User";
import Chats from "@models/Chats";
import { EMessageType } from "@definitions/enums";

function generateUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const username = faker.internet.userName();
    const name = faker.name.fullName();
    const password = faker.internet.password();
    const salt = faker.random.alphaNumeric(16);
    const profileImage = {
      url: faker.internet.avatar(),
      filename: "",
    };

    const about = faker.lorem.sentence();
    const role = "user";

    users.push({
      username,
      name,
      password,
      salt,
      profileImage,
      about,
      role,
      isActive: true,
      lastSeenAt: faker.date.recent(),
    });
  }
  return users;
}

function getRandomValueFromArray<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

async function generateChats(count: number, userIds: string[]) {
  const chats = [];
  for (let i = 0; i < count; i++) {
    const userId = getRandomValueFromArray(userIds);
    let receiverId;
    do {
      receiverId = getRandomValueFromArray(userIds);
    } while (receiverId === userId);

    chats.push({
      userId,
      receiverId,
      messages: [],
    });
  }
  return chats;
}

async function generateMessages(
  count: number,
  userIds: string[],
  chatIds: string[]
) {
  const messages = [];
  for (let i = 0; i < count; i++) {
    const content = faker.lorem.sentence();
    const chatId = getRandomValueFromArray(chatIds);
    messages.push({
      userId: getRandomValueFromArray(userIds),
      content,
      chatId,
      type: EMessageType.Text,
      sentAt: faker.date.recent(),
    });
  }
  return messages;
}

async function seedDatabase(
  userCount: number,
  chatCount: number,
  messageCount: number
) {
  try {
    await connectDB();

    // Remove existing data
    await User.deleteMany();
    await Chats.deleteMany();
    await Message.deleteMany();

    // Generate and insert users
    const users = generateUsers(userCount);
    const insertedUsers = await User.insertMany(users);
    const userIds = insertedUsers.map((user) => user._id.toString());

    console.log(`Database seeded with ${userCount} users successfully`);

    // Generate and insert chats
    const chats = await generateChats(chatCount, userIds);
    const insertedChats = await Chats.insertMany(chats);
    const chatIds = insertedChats.map((chat) => chat._id.toString());

    console.log(`Database seeded with ${chatCount} chats successfully`);

    // Generate and insert messages
    const messages = await generateMessages(messageCount, userIds, chatIds);
    await Message.insertMany(messages);

    console.log(`Database seeded with ${messageCount} messages successfully`);

    // Update chats with message IDs
    for (const chat of insertedChats) {
      const chatMessages = await Message.find({ conversation: chat._id });
      chat.messages = chatMessages.map((message) => message._id);
      await chat.save();
    }

    console.log("Chats updated with message IDs successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

// Seed the database with 100 users, 200 chats, and 1000 messages
seedDatabase(100, 200, 1000);
