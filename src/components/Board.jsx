import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import BoardLanes from "./BoardLanes";

const Board = () => {
  const [columns, setColumns] = useState([
    { id: "todo", title: "To Do", cards: [] },
    { id: "inprogress", title: "In Progress", cards: [] },
    { id: "completed", title: "Completed", cards: [] },
  ]);

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
          />
        ))}
      </div>
    </DndContext>
  );
};

export default Board;
