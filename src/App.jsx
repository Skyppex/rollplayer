import "./App.css";
import "./index.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

const firebaseConfig = {
  apiKey: "AIzaSyBe7tyoD_Qvu3vHlGjfk9LcTgOg9EWbJO4",
  authDomain: "rollplayer.firebaseapp.com",
  projectId: "rollplayer",
  storageBucket: "rollplayer.appspot.com",
  messagingSenderId: "764948674147",
  appId: "1:764948674147:web:d41912b596cc8f4dc86a56",
  measurementId: "G-WZQ65L456N",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header></header>
      <p className="text-red-500">Roll Player</p>
      <section>{user ? <Dashboard /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function Dashboard(props) {
  return (
    <div>
      <button className="text-red-500">Create Character</button>
      <Menu as="div">
        <MenuButton>Menu</MenuButton>
        <MenuItems>
          <MenuItem>
            <SignOut />
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

export default App;
