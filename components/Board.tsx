'use client';
import { useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import { useBoardStore } from '@/store/BoardStore';
import Column from '@/components/Column';

const Board = () => {
  const { board, setBoardState, getBoard, updateTodoInDB } = useBoardStore(
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

      const [removed] = entries.splice(source.index, 1);

      entries.splice(destination.index, 0, removed);

      const rearrangedCols = new Map(entries);

      setBoardState({
        ...board,
        columns: rearrangedCols,
      });

      return;
    }

    const columns = Array.from(board.columns);

    const startColumn = columns[Number(source.droppableId)];

    const endColumn = columns[Number(destination.droppableId)];

    const newStartColumn: Column = {
      id: startColumn[0],
      todos: startColumn[1].todos,
    };

    const newEndColumn: Column = {
      id: endColumn[0],
      todos: endColumn[1].todos,
    };

    if (source.index === destination.index) {
      return;
    }

    const newTodos = newStartColumn.todos;

    const [todoMoved] = newTodos.splice(source.index, 1);

    if (newStartColumn.id === newEndColumn.id) {
      newTodos.splice(destination.index, 0, todoMoved);

      const newColumn = {
        id: newStartColumn.id,
        todos: newTodos,
      };

      const newColumns = new Map(board.columns);

      newColumns.set(newStartColumn.id, newColumn);

      // TODO: changing order in same column do not be implemented

      setBoardState({ ...board, columns: newColumns });
    } else {
      const newColumns = new Map(board.columns);

      newColumns.set(newStartColumn.id, {
        id: newStartColumn.id,
        todos: newTodos,
      });

      const newEndTodos = Array.from(newEndColumn.todos);

      newEndTodos.splice(destination.index, 0, todoMoved);

      newColumns.set(newEndColumn.id, {
        id: newEndColumn.id,
        todos: newEndTodos,
      });

      updateTodoInDB(todoMoved, newEndColumn.id);

      setBoardState({ ...board, columns: newColumns });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <Column key={id} id={id} todos={column.todos} index={index} />
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
