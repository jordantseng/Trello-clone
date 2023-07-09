'use client';
import { useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';

import { useBoardStore } from '@/store/BoardStore';
import Column from '@/components/Column';

const Board = () => {
  const board = useBoardStore((state) => state.board);
  const getBoard = useBoardStore((state) => state.getBoard);
  const updateColumnOrder = useBoardStore((state) => state.updateColumnOrder);

  useEffect(() => {
    getBoard();
  }, [getBoard]);

  const handleDragEnd = (result: DropResult) => {
    updateColumnOrder(result);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <div
            {...provided.droppableProps}
            className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-3"
            ref={provided.innerRef}
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <Column key={id} id={id} index={index} todos={column.todos} />
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
