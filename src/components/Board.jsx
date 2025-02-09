import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import BoardLanes from "./BoardLanes";
import client, { database } from "../appwriteConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Board = () => {
  const [boardLanes, setBoardLanes] = useState([
    { id: "todo", title: "To Do", cards: [] },
    { id: "inprogress", title: "In Progress", cards: [] },
    { id: "completed", title: "Completed", cards: [] },
  ]);

  useEffect(() => {
    const fetchCards = async () => {
      const response = await database.listDocuments(
        "67714f2e0006d28825f7",
        "67714f5100032d069052"
      );
      const cards = response.documents;

      setBoardLanes((prevBoardColumns) => {
        const updatedColumns = prevBoardColumns.map((lane) => {
          const filteredCards = cards.filter(
            (card) => card.columnId === lane.id
          );
          return {
            ...lane,
            cards: filteredCards,
          };
        });
        return updatedColumns;
      });
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
        setBoardLanes((prevBoardColumns) => {
          return prevBoardColumns.map((lane) => {
            if (lane.id === changedCards.columnId) {
              return { ...lane, cards: [changedCards, ...lane.cards] };
            }
            return lane;
          });
        });
        toast.success("New comment added! 🚀");
      }

      if (eventType.includes("update")) {
        setBoardLanes((prevBoardColumns) => {
          return prevBoardColumns.map((lane) => {
            if (lane.id === changedCards.columnId) {
              const updatedCards = lane.cards.map((card) =>
                card.$id === changedCards.$id ? changedCards : card
              );
              return { ...lane, cards: updatedCards };
            }
            return lane;
          });
        });
        toast.info("Comment edited ✏️");
      }

      if (eventType.includes("delete")) {
        setBoardLanes((prevBoardColumns) => {
          return prevBoardColumns.map((lane) => {
            return {
              ...lane,
              cards: lane.cards.filter((card) => card.$id !== changedCards.$id),
            };
          });
        });
        toast.error("Comment deleted 🗑️");
      }
    });

    return () => unsubscribe();
  }, []);

  const addCard = (lanesId, addNewCard) => {
    setBoardLanes((prev) =>
      prev.map((lane) => {
        if (lane.id === lanesId) {
          return {
            ...lane,
            cards: [
              ...lane.cards,
              { id: Date.now().toString(), ...addNewCard },
            ],
          };
        }
        return lane;
      })
    );
  };

  const modifyCard = (lanesId, cardId, modifyCard) => {
    setBoardLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== lanesId) return lane;

        const updatedCards = lane.cards.map((card) => {
          if (card.id === cardId || card.$id === cardId) {
            return { ...card, ...modifyCard };
          }
          return card;
        });

        return { ...lane, cards: updatedCards };
      })
    );
  };

  const deleteCard = (lanesId, cardId) => {
    setBoardLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== lanesId) return lane;

        const modifiedCards = lane.cards.filter(
          (card) => card.id !== cardId && card.$id !== cardId
        );

        return { ...lane, cards: modifiedCards };
      })
    );
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const [fromColumnId, cardId] = active.id.split("-");
    const [toColumnId] = over.id.split("-");

    if (fromColumnId === toColumnId) return;

    setBoardLanes((prev) => {
      const updatedColumns = [...prev];
      const fromColumn = updatedColumns.find(
        (lane) => lane.id === fromColumnId
      );
      const toColumn = updatedColumns.find((lane) => lane.id === toColumnId);

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
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
        />
        {boardLanes.map((lane) => (
          <BoardLanes
            key={lane.id}
            column={lane}
            addCard={addCard}
            modifyCard={modifyCard}
            deleteCard={deleteCard}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default Board;
