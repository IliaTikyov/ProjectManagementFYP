import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import BoardLanes from "./BoardLanes";
import { database } from "../appwriteConfig";

const Board = () => {
  const [columns, setColumns] = useState([
    { id: "todo", title: "To Do", cards: [] },
    { id: "inprogress", title: "In Progress", cards: [] },
    { id: "completed", title: "Completed", cards: [] },
  ]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        console.log("Fetching cards...");
        const response = await database.listDocuments(
          "67714f2e0006d28825f7",
          "67714f5100032d069052"
        );
        console.log("Fetched data:", response);
        const cards = response.documents;

        // Populate columns with fetched cards
        setColumns((prevColumns) => {
          const updatedColumns = prevColumns.map((col) => {
            const filteredCards = cards.filter(
              (card) => card.columnId === col.id
            );
            console.log(`Assigning cards to column ${col.id}:`, filteredCards);
            return {
              ...col,
              cards: filteredCards,
            };
          });
          console.log("Updated columns:", updatedColumns);
          return updatedColumns;
        });
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };

    fetchCards();
  }, []);

  const addCard = (columnId, newCard) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: [...col.cards, { id: Date.now().toString(), ...newCard }],
            }
          : col
      )
    );
  };

  const updateCard = (columnId, cardId, updatedCard) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map((card) =>
                card.id === cardId ? { ...card, ...updatedCard } : card
              ),
            }
          : col
      )
    );
  };

  const deleteCard = (columnId, cardId) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.filter((card) => card.id !== cardId),
            }
          : col
      )
    );
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const [fromColumnId, cardId] = active.id.split("-");
    const [toColumnId] = over.id.split("-");

    if (fromColumnId === toColumnId) return;

    setColumns((prev) => {
      const updatedColumns = [...prev];
      const fromColumn = updatedColumns.find((col) => col.id === fromColumnId);
      const toColumn = updatedColumns.find((col) => col.id === toColumnId);

      if (!fromColumn || !toColumn) return prev;

      const cardIndex = fromColumn.cards.findIndex(
        (card) => card.id === cardId
      );
      const [movedCard] = fromColumn.cards.splice(cardIndex, 1);

      toColumn.cards.push(movedCard);

      return updatedColumns;
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 p-4">
        {columns.map((column) => (
          <BoardLanes
            key={column.id}
            column={column}
            addCard={addCard}
            updateCard={updateCard}
            deleteCard={deleteCard}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default Board;
