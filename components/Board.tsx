'use client';
import { useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';

import { useBoardStore } from '@/store/BoardStore';
import Column from '@/components/Column';

const Board = () => {
  const columns = useBoardStore((state) => state.columns);
  const getColumns = useBoardStore((state) => state.getColumns);
  const setColumns = useBoardStore((state) => state.setColumns);

  useEffect(() => {
    getColumns();
  }, [getColumns]);

  const handleDragEnd = (result: DropResult) => {
    setColumns(result);
  };

  console.log(columns)

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <div
            {...provided.droppableProps}
            className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-3"
            ref={provided.innerRef}
          >
            {Array.from(columns.entries()).map(([id, column], index) => (
              <Column key={id} id={id} index={index} todos={column.todos} />
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
