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
    }

    const columns = Array.from(board.columns);
    // FIXME: error 
    const startColIndex = columns[Number(source.index)];
    const endColIndex = columns[Number(destination.index)];

    const startCol: Column = {
      id: startColIndex[0],
      todos: startColIndex[1].todos,
    };

    const endCol: Column = {
      id: endColIndex[0],
      todos: endColIndex[1].todos,
    };

    if (!startCol || !endCol) {
      return;
    }

    if (source.index === destination.index && startCol === endCol) {
      return;
    }

    const newTodos = startCol.todos;
    const [todoMoved] = newTodos.splice(source.index, 1);

    if (startCol.id === endCol.id) {
      newTodos.splice(destination.index, 0, todoMoved);
      const newCol = {
        id: startCol.id,
        todos: newTodos,
      };
      const newCols = new Map(board.columns);
      newCols.set(startCol.id, newCol);
      setBoardState({ ...board, columns: newCols });
    } else {
      const newCols = new Map(board.columns);
      newCols.set(startCol.id, {
        id: startCol.id,
        todos: newTodos,
      });

      const endTodos = Array.from(endCol.todos);
      endTodos.splice(destination.index, 0, todoMoved);
      newCols.set(endCol.id, {
        id: endCol.id,
        todos: endTodos,
      });
      updateTodoInDB(todoMoved, endCol.id);
      setBoardState({ ...board, columns: newCols });
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
