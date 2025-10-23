import { signOut } from "firebase/auth";
import { auth } from "./App";

export function SignOut() {
  return (
    auth.currentUser && <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}
