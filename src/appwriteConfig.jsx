import { Client, Account, Databases, ID, Teams } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const database = new Databases(client);
export const teams = new Teams(client);

export const uniqueID = ID;

export default client;
