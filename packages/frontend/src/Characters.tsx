import { trpc } from "./lib/trpc";

export function Characters() {
  const utils = trpc.useUtils();

  // Query to get characters
  const { data: characters, isLoading } = trpc.character.list.useQuery();

  // Mutation to create a character
  const createCharacter = trpc.character.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch characters list after creating
      utils.character.list.invalidate();
    },
  });

  const handleCreateCharacter = () => {
    // Create a character with some default values
    createCharacter.mutate({
      name: "New Character",
      class: "Fighter",
      level: 1,
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-start p-4 min-h-[80vh]">
        <div className="text-center">
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 min-h-[80vh]">
      <div className="text-center">
        <div>
          <h2 className="text-xl font-bold mb-4">Your Characters</h2>
          <div className="mb-4">
            <button
              onClick={handleCreateCharacter}
              disabled={createCharacter.isPending}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createCharacter.isPending ? "Creating..." : "+"}
            </button>
          </div>

          {characters && characters.length > 0 ? (
            <div className="grid gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="border rounded-lg p-4 bg-white shadow"
                >
                  <h3 className="text-lg font-semibold">{character.name}</h3>
                  <p className="text-sm text-gray-600">
                    {character.class} - Level {character.level}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No characters yet. Create your first character!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
