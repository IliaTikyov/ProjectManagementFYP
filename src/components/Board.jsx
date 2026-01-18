/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import BoardLanes from "./BoardLanes";
import client, { database } from "../appwriteConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const INITIAL_LANES = [
  { id: "todo", title: "To Do", cards: [] },
  { id: "inprogress", title: "In Progress", cards: [] },
  { id: "completed", title: "Completed", cards: [] },
];

const getCardKey = (card) => String(card?.$id ?? card?.id ?? "");

const upsertCardIntoLanes = (lanes, card) => {
  const key = getCardKey(card);
  if (!key) return lanes;

  const cleaned = lanes.map((lane) => ({
    ...lane,
    cards: lane.cards.filter((c) => getCardKey(c) !== key),
  }));

  const targetLaneId = card?.columnId;
  if (!targetLaneId) return cleaned;

  return cleaned.map((lane) => {
    if (lane.id !== targetLaneId) return lane;
    return { ...lane, cards: [card, ...lane.cards] };
  });
};

const removeCardFromLanes = (lanes, cardOrId) => {
  const key =
    typeof cardOrId === "string" ? cardOrId : getCardKey(cardOrId ?? {});
  if (!key) return lanes;

  return lanes.map((lane) => ({
    ...lane,
    cards: lane.cards.filter((c) => getCardKey(c) !== String(key)),
  }));
};

const Board = () => {
  const [boardLanes, setBoardLanes] = useState(INITIAL_LANES);
  const [hydrating, setHydrating] = useState(true);

  const pendingMovesRef = useRef(new Set());

  const channel = useMemo(
    () => `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`,
    []
  );

  const fetchCards = async () => {
    try {
      setHydrating(true);
      const response = await database.listDocuments(DATABASE_ID, COLLECTION_ID);
      const cards = response?.documents ?? [];

      setBoardLanes((prev) =>
        prev.map((lane) => ({
          ...lane,
          cards: cards.filter((card) => card.columnId === lane.id),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      toast.error("Failed to load board data.");
    } finally {
      setHydrating(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    const unsubscribe = client.subscribe(channel, (response) => {
      const eventType = response?.events?.[0] ?? "";
      const changedCard = response?.payload;

      if (!changedCard) return;

      const key = getCardKey(changedCard);
      if (pendingMovesRef.current.has(key) && eventType.includes("update")) {
        pendingMovesRef.current.delete(key);
        return;
      }

      if (eventType.includes("create")) {
        setBoardLanes((prev) => upsertCardIntoLanes(prev, changedCard));
        toast.success("New comment added! 🚀");
        return;
      }

      if (eventType.includes("update")) {
        setBoardLanes((prev) => upsertCardIntoLanes(prev, changedCard));
        toast.info("Comment updated ✏️");
        return;
      }

      if (eventType.includes("delete")) {
        setBoardLanes((prev) => removeCardFromLanes(prev, changedCard));
        toast.error("Comment deleted 🗑️");
      }
    });

    return () => {
      try {
        unsubscribe?.();
      } catch (e) {}
    };
  }, [channel]);

  const addCard = (laneId, addNewCard) => {
    setBoardLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== laneId) return lane;
        return {
          ...lane,
          cards: [...lane.cards, { id: Date.now().toString(), ...addNewCard }],
        };
      })
    );
  };

  const modifyCard = (laneId, cardId, patch) => {
    setBoardLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== laneId) return lane;
        const updatedCards = lane.cards.map((card) => {
          const key = getCardKey(card);
          if (key === String(cardId)) return { ...card, ...patch };
          return card;
        });
        return { ...lane, cards: updatedCards };
      })
    );
  };

  const deleteCard = (laneId, cardId) => {
    setBoardLanes((prev) =>
      prev.map((lane) => {
        if (lane.id !== laneId) return lane;
        return {
          ...lane,
          cards: lane.cards.filter(
            (card) => getCardKey(card) !== String(cardId)
          ),
        };
      })
    );
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;

    const [fromLaneId, cardId] = String(active.id).split("-");
    const [toLaneId] = String(over.id).split("-");

    if (!fromLaneId || !toLaneId || !cardId) return;
    if (fromLaneId === toLaneId) return;

    let movedCard = null;

    setBoardLanes((prev) => {
      const next = prev.map((lane) => ({ ...lane, cards: [...lane.cards] }));

      const fromLane = next.find((l) => l.id === fromLaneId);
      const toLane = next.find((l) => l.id === toLaneId);
      if (!fromLane || !toLane) return prev;

      const idx = fromLane.cards.findIndex(
        (c) => getCardKey(c) === String(cardId)
      );
      if (idx === -1) return prev;

      const original = fromLane.cards[idx];
      movedCard = { ...original, columnId: toLaneId };

      fromLane.cards.splice(idx, 1);
      toLane.cards.push(movedCard);

      return next;
    });

    try {
      if (movedCard?.$id) {
        pendingMovesRef.current.add(getCardKey(movedCard));

        await database.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          movedCard.$id,
          { columnId: toLaneId }
        );
      } else {
        console.warn(
          "Moved card has no $id. Persisting requires an Appwrite document id."
        );
      }
    } catch (error) {
      console.error("Failed to persist move:", error);
      toast.error("Failed to move card. Reloading…");
      await fetchCards();
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 p-4">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
        />

        {hydrating ? (
          <div className="w-full text-center text-gray-600 py-10">
            Loading board…
          </div>
        ) : (
          boardLanes.map((lane) => (
            <BoardLanes
              key={lane.id}
              column={lane}
              addCard={addCard}
              modifyCard={modifyCard}
              deleteCard={deleteCard}
            />
          ))
        )}
      </div>
    </DndContext>
  );
};

export default Board;
