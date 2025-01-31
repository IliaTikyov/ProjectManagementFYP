import UserComments from "../components/UserComments";
import { useAuth } from "../utils/AuthContext";

const Members = () => {
  const { user } = useAuth();

  return (
    <div>
      <UserComments taskId={"12345"} userId={user.name} />
    </div>
  );
};

export default Members;
