// services/projectService.js
import { databases } from "./appwriteClient";

export async function createProject(data) {
  return await databases.createDocument(
    "dbId",
    "collectionId",
    "unique()",
    data,
  );
}

export async function getProjects() {
  return await databases.listDocuments("dbId", "collectionId");
}
