import { useDraggable } from "@dnd-kit/core";

const priorityColors = {
  low: "text-white bg-green-500",
  medium: "text-white bg-yellow-500",
  high: "text-white bg-red-500",
};

const CardItems = ({ card, columnId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${columnId}-${card.id}`,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white shadow-md p-2 rounded-md"
    >
      <p className="font-bold">{card.content}</p>
      {card.description && (
        <p className="text-sm text-gray-500">{card.description}</p>
      )}
      {card.priority && (
        <span
          className={`inline-block mx-auto px-5 py-1 mt-2 text-xs font-semibold rounded-md ${
            priorityColors[card.priority]
          }`}
        >
          {card.priority.toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default CardItems;
