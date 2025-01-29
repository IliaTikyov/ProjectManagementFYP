import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import BoardLanes from "./BoardLanes";
import client, { database } from "../appwriteConfig";

const Board = () => {
  const [boardLanes, setBoardLanes] = useState([
    { id: "todo", title: "To Do", cards: [] },
    { id: "inprogress", title: "In Progress", cards: [] },
    { id: "completed", title: "Completed", cards: [] },
  ]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await database.listDocuments(
          "67714f2e0006d28825f7",
          "67714f5100032d069052"
        );
        const cards = response.documents;

        setBoardLanes((prevColumns) => {
          const updatedColumns = prevColumns.map((col) => {
            const filteredCards = cards.filter(
              (card) => card.columnId === col.id
            );
            return {
              ...col,
              cards: filteredCards,
            };
          });
          return updatedColumns;
        });
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };

    fetchCards();
  }, []);

  useEffect(() => {
    const channel =
      "databases.67714f2e0006d28825f7.collections.67714f5100032d069052.documents";

    const unsubscribe = client.subscribe(channel, (response) => {
      const eventType = response.events[0];
      const changedCards = response.payload;

      if (eventType.includes("create")) {
        setBoardLanes((prevColumns) => {
          return prevColumns.map((col) => {
            if (col.id === changedCards.columnId) {
              return { ...col, cards: [changedCards, ...col.cards] };
            }
            return col;
          });
        });
      }

      if (eventType.includes("update")) {
        setBoardLanes((prevColumns) => {
          return prevColumns.map((col) => {
            if (col.id === changedCards.columnId) {
              const updatedCards = col.cards.map((card) =>
                card.$id === changedCards.$id ? changedCards : card
              );
              return { ...col, cards: updatedCards };
            }
            return col;
          });
        });
      }

      if (eventType.includes("delete")) {
        setBoardLanes((prevColumns) => {
          return prevColumns.map((col) => {
            return {
              ...col,
              cards: col.cards.filter((card) => card.$id !== changedCards.$id),
            };
          });
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const addCard = (columnId, newCard) => {
    setBoardLanes((prev) =>
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
    setBoardLanes((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map((card) =>
                card.id === cardId || card.$id === cardId
                  ? { ...card, ...updatedCard }
                  : card
              ),
            }
          : col
      )
    );
  };

  const deleteCard = (columnId, cardId) => {
    setBoardLanes((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.filter(
                (card) => card.id !== cardId && card.$id !== cardId
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

    setBoardLanes((prev) => {
      const updatedColumns = [...prev];
      const fromColumn = updatedColumns.find((col) => col.id === fromColumnId);
      const toColumn = updatedColumns.find((col) => col.id === toColumnId);

      if (!fromColumn || !toColumn) return prev;

      const cardIndex = fromColumn.cards.findIndex(
        (card) => card.id === cardId || card.$id === cardId
      );
      const [movedCard] = fromColumn.cards.splice(cardIndex, 1);

      toColumn.cards.push(movedCard);

      movedCard.columnId = toColumnId;

      database.updateDocument(
        "67714f2e0006d28825f7",
        "67714f5100032d069052",
        movedCard.$id,
        { columnId: toColumnId }
      );

      return updatedColumns;
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 p-4">
        {boardLanes.map((column) => (
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
