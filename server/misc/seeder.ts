import { faker } from "@faker-js/faker";
import connectDB from "../database/connectDB";
import User from "../models/User";

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

seedUserDatabase(20);
