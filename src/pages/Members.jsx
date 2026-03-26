import UserComments from "../components/project/UserComments";
import { useAuth } from "../context/AuthContext";

const Members = () => {
  const { user } = useAuth();

  // temporary task id (replace later with real task id)
  const taskId = "12345";

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Loading user...
      </div>
    );
  }

  return (
    <div className="p-6">
      <UserComments taskId={taskId} userId={user.name} />
    </div>
  );
};

export default Members;
