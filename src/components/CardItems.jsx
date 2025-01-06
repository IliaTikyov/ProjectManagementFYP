import { useDraggable } from "@dnd-kit/core";

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
      {card.content}
      {card.description && (
        <p className="text-sm text-gray-500">{card.description}</p>
      )}
    </div>
  );
};

export default CardItems;
