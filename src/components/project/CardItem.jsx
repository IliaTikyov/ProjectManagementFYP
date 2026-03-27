/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/core";
import { IoIosWarning } from "react-icons/io";
import { IoTimeSharp } from "react-icons/io5";

const priorityOptions = {
  low: "bg-green-500 text-white",
  medium: "bg-yellow-500 text-white",
  high: "bg-red-500 text-white",
};

const CardItem = ({ card, columnId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${columnId}-${card.$id}`,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const today = new Date();

  const daysDiff = dueDate
    ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = dueDate && dueDate < today;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing p-4"
    >
      {/* Title */}
      <p className="font-semibold text-gray-800 text-sm mb-1">{card.content}</p>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-3">
          {card.description}
        </p>
      )}

      {/* Priority */}
      {card.priority && (
        <span
          className={`inline-block px-2 py-1 text-xs font-semibold rounded-md mb-2 ${priorityOptions[card.priority]}`}
        >
          {card.priority.toUpperCase()}
        </span>
      )}

      {/* Due Date */}
      {dueDate && (
        <div className="flex items-center text-xs mt-2">
          {!isOverdue ? (
            <div className="flex items-center text-blue-600 gap-1">
              <IoTimeSharp size={14} />
              <span>
                {dueDate.toLocaleDateString()} ({daysDiff} days)
              </span>
            </div>
          ) : (
            <div className="flex items-center text-red-500 gap-1">
              <IoIosWarning size={16} />
              <span>Overdue by {Math.abs(daysDiff)} days</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardItem;
