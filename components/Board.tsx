'use client';
import { useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';

import { useBoardStore } from '@/store/BoardStore';
import Column from '@/components/Column';

const Board = () => {
  const { board, setBoardState, getBoard, updateTodoOrder } = useBoardStore(
    (state) => state
  );

  useEffect(() => {
    getBoard();
  }, [getBoard]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (type === 'column') {
      const entries = Array.from(board.columns.entries());

      const [sourceEntry] = entries.splice(source.index, 1);

      entries.splice(destination.index, 0, sourceEntry);

      const rearrangedCols = new Map(entries);

      setBoardState({
        ...board,
        columns: rearrangedCols,
      });

      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newColumnEntries = Array.from(structuredClone(board.columns));

    const startColumnEntry = newColumnEntries[Number(source.droppableId)];

    const newStartColumn: Column = {
      id: startColumnEntry[0],
      todos: structuredClone(startColumnEntry[1].todos),
    };

    const endColumnEntry = newColumnEntries[Number(destination.droppableId)];

    const newEndColumn: Column = {
      id: endColumnEntry[0],
      todos: structuredClone(endColumnEntry[1].todos),
    };

    const newStartTodos = newStartColumn.todos;

    const [todoMoved] = newStartTodos.splice(source.index, 1);

    if (newStartColumn.id === newEndColumn.id) {
      newStartTodos.splice(destination.index, 0, todoMoved);

      const newColumn = {
        id: newStartColumn.id,
        todos: newStartTodos.map((todo, index) => ({
          ...todo,
          index,
        })),
      };

      const newColumns = new Map(structuredClone(board.columns));

      newColumns.set(newStartColumn.id, newColumn);

      const result: Todo[] = [];

      newColumns.forEach((column) => {
        result.push(...column.todos);
      });

      updateTodoOrder(result);

      setBoardState({ ...board, columns: newColumns });
    } else {
      const newColumns = new Map(structuredClone(board.columns));

      newColumns.set(newStartColumn.id, {
        ...newStartColumn,
        todos: newStartTodos.map((todo, index) => ({ ...todo, index })),
      });

      const newEndTodos = Array.from(newEndColumn.todos);

      newEndTodos.splice(destination.index, 0, {
        ...todoMoved,
        status: newEndColumn.id,
      });

      newColumns.set(newEndColumn.id, {
        ...newEndColumn,
        todos: newEndTodos.map((todo, index) => ({ ...todo, index })),
      });

      const result: Todo[] = [];

      newColumns.forEach((column) => {
        result.push(...column.todos);
      });

      updateTodoOrder(result);

      setBoardState({ ...board, columns: newColumns });
    }
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
