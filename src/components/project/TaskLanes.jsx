/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import CardItem from "./CardItem";
import { FaEdit, FaTrashAlt, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  account,
  database,
  uniqueID,
  teams,
} from "../../services/appwriteClient";

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

const TaskLanes = ({ column, modifyCard, deleteCard }) => {
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
      cardData,
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
    <div
      ref={setNodeRef}
      className="flex flex-col flex-1 min-w-[280px] bg-slate-100 rounded-xl p-4 shadow-sm overflow-visible"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700">{column.title}</h2>

        <span className="text-sm text-slate-500">
          {column.cards?.length || 0}
        </span>
      </div>

      {/* Add Card Form */}
      {isAdding ? (
        <div className="mb-4 p-4 bg-white rounded-lg border shadow-sm space-y-2">
          <input
            type="text"
            placeholder="Task title"
            value={newCard.content}
            onChange={(e) =>
              setNewCard({ ...newCard, content: e.target.value })
            }
            className="w-full p-2 border rounded-md text-sm"
          />

          <textarea
            placeholder="Description"
            value={newCard.description}
            onChange={(e) =>
              setNewCard({ ...newCard, description: e.target.value })
            }
            className="w-full p-2 border rounded-md text-sm"
          />

          <div className="flex items-center gap-2">
            <DatePicker
              selected={selectDate}
              onChange={(date) => setSelectDate(date)}
              isClearable
              placeholderText="Due date"
              className="w-full p-2 border rounded-md text-sm"
            />
            <FaCalendarAlt className="text-blue-500" />
          </div>

          <select
            value={newCard.priority}
            onChange={(e) =>
              setNewCard({ ...newCard, priority: e.target.value })
            }
            className="w-full p-2 border rounded-md text-sm"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md text-sm transition"
            >
              Add Task
            </button>

            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md text-sm transition"
        >
          + Add Task
        </button>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1">
        {column.cards && column.cards.length > 0 ? (
          column.cards.map((card) => (
            <div key={card.$id} className="relative group">
              {editingCardId === card.$id ? (
                <div className="p-4 bg-white rounded-lg border shadow-sm space-y-2">
                  <input
                    type="text"
                    value={editCard.content}
                    onChange={(e) =>
                      setEditCard({
                        ...editCard,
                        content: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  />

                  <textarea
                    value={editCard.description}
                    onChange={(e) =>
                      setEditCard({
                        ...editCard,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <DatePicker
                      selected={selectDate}
                      onChange={(date) => setSelectDate(date)}
                      isClearable
                      placeholderText="Due date"
                      className="w-full p-2 border rounded-md text-sm"
                    />
                    <FaCalendarAlt className="text-blue-500" />
                  </div>

                  <select
                    value={editCard.priority}
                    onChange={(e) =>
                      setEditCard({
                        ...editCard,
                        priority: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm transition"
                    >
                      Save
                    </button>

                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <CardItem card={card} columnId={column.id} />

                  <button
                    onClick={() => handleEdit(card)}
                    className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition bg-white shadow rounded p-1 text-orange-500"
                  >
                    <FaEdit size={12} />
                  </button>

                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(column.id, card.$id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-white shadow rounded p-1 text-red-500"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-400 py-6">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLanes;
