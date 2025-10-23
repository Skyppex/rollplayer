import "./index.css";

import { Tabs } from "@ark-ui/react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Characters } from "./Characters";
import { TRPCProvider } from "./components/TRPCProvider";
import { Menu } from "./Menu";
import { SignIn } from "./SignIn";

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

export interface CharacterCardProps {
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
export const auth = getAuth(app);

function App() {
  const [user] = useAuthState(auth);
  const charactersTab = "charactersTab";

  return (
    <TRPCProvider>
      <div className="min-h-screen">
        {user ? (
          <Tabs.Root defaultValue={charactersTab}>
            {/* Navbar */}
            <nav className="w-full flex justify-center items-center p-4 border-b">
              <div className="flex items-center space-x-8">
                {/* Characters tab in the middle */}
                <Tabs.List className="flex">
                  <Tabs.Trigger
                    value={charactersTab}
                    className="
                    m-1
                    text-lg
                    font-medium
                    text-gray-700
                    hover:text-blue-600
                    border-b-2
                    border-transparent
                    hover:border-blue-600
                    data-[state=active]:text-blue-600
                    data-[state=active]:border-blue-600"
                  >
                    Characters
                  </Tabs.Trigger>
                </Tabs.List>
                {/* Menu on the right */}
                <Menu />
              </div>
            </nav>

            {/* Content area */}
            <Tabs.Content value={charactersTab}>
              <Characters />
            </Tabs.Content>
          </Tabs.Root>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <SignIn />
          </div>
        )}
      </div>
    </TRPCProvider>
  );
}

export default App;
