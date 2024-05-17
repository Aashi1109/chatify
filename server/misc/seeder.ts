import connectDB from "@database/connectDB";
import { faker } from "@faker-js/faker";
import Message from "@models/Message";
import User from "@models/User";

function generateUsers(count) {
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

function getRandomValueFromArray(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function generateMessages(count) {
  const messages = [];
  const userIds = ["663370a37e1e40d1ddf1e3b4", "66334b36354c1f9b14b8a54f"];
  const chatId = ["663e4bc334879ac676547e06"];
  for (let i = 0; i < count; i++) {
    const content = faker.lorem.sentence();
    messages.push({
      userId: getRandomValueFromArray(userIds),
      content,
      chatId: chatId[0],
    });
  }

  return messages;
}

async function seedUserDatabase(count) {
  try {
    await connectDB();
    // Remove existing users
    await User.deleteMany();

    // Generate fake users
    const users = generateUsers(count);

    // Insert users into the database
    await User.insertMany(users);

    console.log(`Database seeded with ${count} users successfully`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
  }
}
async function seedMessageDatabase(count) {
  try {
    await connectDB();
    // Remove existing users
    await Message.deleteMany();

    // Generate fake users
    const users = generateMessages(count);

    // Insert users into the database
    await Message.insertMany(users);

    console.log(`Database seeded with ${count} messages successfully`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
  }
}

seedMessageDatabase(2000);
