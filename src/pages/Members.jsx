import UserComments from "../components/project/UserComments";
import { useAuth } from "../context/AuthContext";

const Members = () => {
  const { user } = useAuth();

  return (
    <div>
      <UserComments taskId={"12345"} userId={user.name} />
    </div>
  );
};

export default Members;
