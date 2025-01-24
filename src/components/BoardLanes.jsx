import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import CardItems from "./CardItems";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createTask } from "../appwriteConfig";

const BoardLanes = ({ column, addCard, updateCard, deleteCard }) => {
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

  const [selectDate, setSelectDate] = useState(null);

  const handleAddCard = async () => {
    if (newCard.content.trim() === "") return;

    try {
      await createTask(
        newCard.content,
        newCard.description,
        newCard.priority,
        selectDate
      );
      addCard(column.id, { ...newCard, dueDate: selectDate });
      setNewCard({ content: "", description: "", priority: "low" });
      setSelectDate(null);
      setIsAdding(false);
    } catch (error) {
      console.error("Error creating task >>", error);
    }
  };

  const handleEditCard = (card) => {
    setEditingCardId(card.id);
    setEditCard({
      content: card.content,
      description: card.description,
      priority: card.priority,
      dueDate: card.dueDate,
    });
    setSelectDate(card.dueDate);
  };

  const handleSave = () => {
    updateCard(column.id, editingCardId, { ...editCard, dueDate: selectDate });
    setEditingCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };

  const handleDeleteCard = (columnId, cardId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteCard(columnId, cardId);
    }
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
          <div className="flex items-center">
            <DatePicker
              selected={selectDate}
              onChange={(date) => setSelectDate(date)}
              //minDate={new Date()}
              isClearable
              placeholderText="Due date"
              className="w-full p-2 mb-2 border rounded"
            />
            <FaCalendarAlt className="h-8 w-8 text-gray-500 ml-2" />
          </div>
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
                <div className="flex items-center">
                  <DatePicker
                    selected={selectDate}
                    onChange={(date) => setSelectDate(date)}
                    //minDate={new Date()}
                    isClearable
                    placeholderText="Due date"
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <FaCalendarAlt className="h-8 w-8 text-gray-500 ml-2" />
                </div>
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
                  className="absolute top-0 right-8 bg-white text-orange-500 px-2 py-1 rounded"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteCard(column.id, card.id)}
                  className="absolute top-0 right-0 bg-white text-red-500 px-2 py-1 rounded"
                >
                  <FaTrashAlt />
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
