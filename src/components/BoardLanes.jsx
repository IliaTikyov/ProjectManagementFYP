import React from "react";
import { useDroppable } from "@dnd-kit/core";
import CardItems from "./CardItems";

const BoardLanes = ({ column }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg w-1/3">
      <h2 className="text-lg font-bold mb-4">{column.title}</h2>
      <div className="space-y-2">
        {column.cards.map((card) => (
          <CardItems key={card.id} card={card} columnId={column.id} />
        ))}
      </div>
    </div>
  );
};

export default BoardLanes;
