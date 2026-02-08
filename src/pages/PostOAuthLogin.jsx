import { Navigate, useParams } from "react-router-dom";

import { useAuth } from "../hooks/AuthProvider";

export function PagePostOAuthLogin() {
  const auth = useAuth();
  const { redirect } = useParams();

  /*useEffect(() => {
    auth.checkSession();
  }, []);
  */
  if (!auth.isLoggedIn) {
    return (
      <div>
        <h1>Logging in...</h1>
      </div>
    );
  }

  return <Navigate to={redirect ? "/" + redirect : "/"} />;
}
