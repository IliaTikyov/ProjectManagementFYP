import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import CardItems from "./CardItems";
import { FaEdit } from "react-icons/fa";

const BoardLanes = ({ column, addCard, updateCard }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const [newCard, setNewCard] = useState({
    content: "",
    description: "",
    priority: "low",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editCard, setEditCard] = useState({
    content: "",
    description: "",
    priority: "low",
  });

  const handleAddCard = () => {
    if (newCard.content.trim() === "") return;
    addCard(column.id, newCard);
    setNewCard({ content: "", description: "", priority: "low" });
    setIsAdding(false);
  };

  const handleEditCard = (card) => {
    setEditingCardId(card.id);
    setEditCard({
      content: card.content,
      description: card.description,
      priority: card.priority,
    });
  };

  const handleSave = () => {
    updateCard(column.id, editingCardId, editCard);
    setEditingCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg w-1/3">
      <h2 className="text-lg font-bold mb-4 flex justify-center">
        {column.title}
      </h2>
      {isAdding ? (
        <div className="mt-4 mb-4 p-2 bg-white rounded-md shadow">
          <input
            type="text"
            placeholder="Task title"
            value={newCard.content}
            onChange={(e) =>
              setNewCard({ ...newCard, content: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={newCard.description}
            onChange={(e) =>
              setNewCard({ ...newCard, description: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
          />
          <select
            value={newCard.priority}
            onChange={(e) =>
              setNewCard({ ...newCard, priority: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex justify-between">
            <button
              onClick={handleAddCard}
              className="bg-green-400 text-white px-4 py-2 rounded"
            >
              + Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-neutral-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-5 bg-green-400 text-white px-4 py-2 rounded-lg"
        >
          + Add Card
        </button>
      )}
      <div className="space-y-2">
        {column.cards.map((card) => (
          <div key={card.id} className="relative">
            {editingCardId === card.id ? (
              <div className="mt-4 mb-4 p-2 bg-white rounded-md shadow">
                <input
                  type="text"
                  value={editCard.content}
                  onChange={(e) =>
                    setEditCard({ ...editCard, content: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <textarea
                  value={editCard.description}
                  onChange={(e) =>
                    setEditCard({ ...editCard, description: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <select
                  value={editCard.priority}
                  onChange={(e) =>
                    setEditCard({ ...editCard, priority: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="flex justify-between">
                  <button
                    onClick={handleSave}
                    className="bg-blue-400 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-neutral-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <CardItems card={card} columnId={column.id} />
                <button
                  onClick={() => handleEditCard(card)}
                  className="absolute top-0 right-0 bg-white text-black px-2 py-1 rounded"
                >
                  <FaEdit />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardLanes;
