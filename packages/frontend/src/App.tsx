import "./App.css";
import "./index.css";

import { Menu } from "@ark-ui/react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { TRPCProvider } from "./components/TRPCProvider";

// TypeScript interfaces
interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  stats: CharacterStats;
}

interface CharacterCardProps {
  character: Character;
}

const firebaseConfig = {
  apiKey: "AIzaSyBe7tyoD_Qvu3vHlGjfk9LcTgOg9EWbJO4",
  authDomain: "rollplayer.firebaseapp.com",
  projectId: "rollplayer",
  storageBucket: "rollplayer.appspot.com",
  messagingSenderId: "764948674147",
  appId: "1:764948674147:web:d41912b596cc8f4dc86a56",
  measurementId: "G-WZQ65L456N",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <TRPCProvider>
      <div className="App">
        <header></header>
        <section>{user ? <Dashboard /> : <SignIn />}</section>
      </div>
    </TRPCProvider>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function Dashboard() {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="flex justify-end mr-2">
        <Menu.Root>
          <Menu.Trigger>Menu</Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="react">
                <SignOut />
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
            Create Character
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Your Characters</h2>
          No characters yet. Create your first character! ))
        </div>
      </div>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}

function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{character.name}</h3>
        <button className="text-red-500 hover:text-red-700 text-sm">
          Delete
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        <span className="font-medium">Class:</span> {character.class} |
        <span className="font-medium"> Level:</span> {character.level}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="font-medium">STR:</span> {character.stats.strength}
        </div>
        <div>
          <span className="font-medium">DEX:</span> {character.stats.dexterity}
        </div>
        <div>
          <span className="font-medium">CON:</span>{" "}
          {character.stats.constitution}
        </div>
        <div>
          <span className="font-medium">INT:</span>{" "}
          {character.stats.intelligence}
        </div>
        <div>
          <span className="font-medium">WIS:</span> {character.stats.wisdom}
        </div>
        <div>
          <span className="font-medium">CHA:</span> {character.stats.charisma}
        </div>
      </div>
    </div>
  );
}

export default App;
