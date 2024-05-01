import "firebase/compat/auth";
import firebase from "firebase/compat/app";
import { useEffect, useState } from "react";
import { App } from "../components/app/App";
import { Login } from "../components/login/Login";
import {
  firebaseEnabled,
  getFirebaseConfig,
} from "../helpers/getFirebaseConfig";
import { getLoginStatus } from "../helpers/getLoginStatus";
import { isLoadedUser } from "../helpers/isLoadedUser";
import { useAuthentication } from "../hooks/useAuthentication";
import { useOffline } from "../hooks/useOffline";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { useUser } from "../hooks/useUser";

// Only create Firebase if it has yet to be initialized
export const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(getFirebaseConfig())
  : firebase.app();

const Index = () => {
  const user = useUser();
  const offline = useOfflineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useOffline();
  useAuthentication(offline);

  return (
    <>
      {mounted ? (
        (isLoadedUser(user) && firebaseEnabled) || getLoginStatus() ? (
          <App />
        ) : (
          <Login />
        )
      ) : (
        <div />
      )}
    </>
  );
};

export default Index;
