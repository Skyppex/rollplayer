import { Menu as ArkMenu } from "@ark-ui/react";
import { SignOut } from "./SignOut";

export function Menu() {
  return (
    <ArkMenu.Root>
      <ArkMenu.Trigger className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium">
        Menu
      </ArkMenu.Trigger>
      <ArkMenu.Positioner>
        <ArkMenu.Content className="bg-white border rounded-lg shadow-lg p-2 min-w-[120px]">
          <ArkMenu.Item
            value="signout"
            className="px-3 py-2 hover:bg-gray-100 rounded"
          >
            <SignOut />
          </ArkMenu.Item>
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </ArkMenu.Root>
  );
}
