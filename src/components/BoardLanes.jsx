/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import CardItems from "./CardItems";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { account, database, uniqueID, teams } from "../appwriteConfig";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const TEAM_ID = import.meta.env.VITE_APPWRITE_TEAM_ID;

const findRole = async () => {
  await account.get();
  const selectRole = await teams.listMemberships(TEAM_ID);
  for (const team of selectRole.memberships) {
    if (team.roles.includes("admin")) return "admin";
  }
  return "user";
};

const BoardLanes = ({ column, modifyCard, deleteCard }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const [role, setRole] = useState("");

  useEffect(() => {
    const findUserRole = async () => {
      const role = await findRole();
      setRole(role);
    };
    findUserRole();
  }, []);

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

  const handleAdd = async () => {
    if (newCard.content.trim() === "") return;
    const cardData = { ...newCard, dueDate: selectDate, columnId: column.id };

    await database.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      uniqueID.unique(),
      cardData
    );

    setNewCard({ content: "", description: "", priority: "low" });
    setSelectDate(null);
    setIsAdding(false);
  };

  const handleEdit = (card) => {
    setEditingCardId(card.$id);
    setEditCard({
      content: card.content,
      description: card.description,
      priority: card.priority,
      dueDate: card.dueDate,
      columnId: column.id,
    });
    setSelectDate(card.dueDate);
  };

  const handleSave = async () => {
    modifyCard(column.id, editingCardId, { ...editCard, dueDate: selectDate });
    setEditingCardId(null);

    await database.updateDocument(DATABASE_ID, COLLECTION_ID, editingCardId, {
      ...editCard,
      dueDate: selectDate,
      columnId: column.id,
    });
  };

  const handleCancel = () => {
    setEditingCardId(null);
  };

  const handleDelete = async (columnId, cardId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await database.deleteDocument(DATABASE_ID, COLLECTION_ID, cardId);

      deleteCard(columnId, cardId);
    }
  };

  return (
    <div ref={setNodeRef} className="bg-slate-100 p-4 rounded-lg w-1/3">
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
              isClearable
              placeholderText="Due date"
              className="w-full p-2 mb-2 border rounded"
            />
            <FaCalendarAlt className=" text-blue-500 h-8 w-8 ml-2" />
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
              onClick={handleAdd}
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
          className=" bg-green-400 text-white w-full mb-5 px-4 py-2 rounded-lg"
        >
          + Add Card
        </button>
      )}
      <div className="space-y-2">
        {column.cards && column.cards.length > 0 ? (
          column.cards.map((card) => (
            <div key={card.$id} className="relative">
              {editingCardId === card.$id ? (
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
                      isClearable
                      placeholderText="Due date"
                      className="w-full p-2 mb-2 border rounded"
                    />
                    <FaCalendarAlt className=" text-blue-500 h-8 w-8 ml-2" />
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
                      onClick={handleCancel}
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
                    onClick={() => handleEdit(card)}
                    className="bg-white text-orange-500 absolute top-0 right-8 px-2 py-1 rounded"
                  >
                    <FaEdit />
                  </button>
                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(column.id, card.$id)}
                      className="bg-white text-red-500 absolute top-0 right-0 px-2 py-1 rounded"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 flex justify-center mt-2 text-lg">
            Please add a card...
          </p>
        )}
      </div>
    </div>
  );
};

export default BoardLanes;
