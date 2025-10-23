import { CharacterCardProps } from "./App";

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
