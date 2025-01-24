import { Client, Account, Databases, ID } from "appwrite";

export const API_ENDPOINT = "https://cloud.appwrite.io/v1";
export const PROJECT_ID = "6769b5f7002bff19fbae";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);

export const account = new Account(client);
export const database = new Databases(client);

export default client;

// Function to create a task
export const createTask = async (Title, Description, Priority, dueDate) => {
  try {
    await database.createDocument(
      "67714f2e0006d28825f7",
      "67714f5100032d069052",
      ID.unique(),
      {
        Title,
        Description,
        Priority,
        dueDate,
      }
    );
    alert("Task Created Successfully");
  } catch (error) {
    console.error("DB Error >>", error);
    alert("Encountered an Error");
  }
};
