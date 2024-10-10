import "./App.css";
import "./index.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Menu } from "@ark-ui/react";

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
    <div className="flex flex-col justify-between min-h-screen">
      <div className="flex justify-end mr-2">
        <Menu.Root>
          <Menu.Trigger>Menu</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item>
                <SignOut />
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
      <div>
        <button>Create Character</button>
      </div>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function CharacterCard(params) {
  return (
    <div>
      <h1>Character Name</h1>
      <p>Character Description</p>
    </div>
  );
}

export default App;
