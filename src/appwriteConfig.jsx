import { Client, Account, Databases, ID, Teams } from "appwrite";

export const API_ENDPOINT = "https://cloud.appwrite.io/v1";
export const PROJECT_ID = "6769b5f7002bff19fbae";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);

export const account = new Account(client);
export const database = new Databases(client);
export const teams = new Teams(client);
export const uniqueID = ID;

export default client;
