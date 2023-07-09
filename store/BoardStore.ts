import { create } from 'zustand';
import { DropResult } from 'react-beautiful-dnd';

import { ID, databases, storages } from '@/appwrite';
import { getTodosGroupedByColumn } from '@/lib/getTodosGroupedByColumn';
import uploadImage from '@/lib/uploadImage';
import updateTodos from '@/lib/updateTodos';

interface BoardState {
  board: Board;
  getBoard: () => void;  
  updateColumnOrder: (result: DropResult) => void;
  newTaskInput: string;
  deleteTask: (taskIndex: number, todo: Todo, id: TypedColumn) => void;
  setNewTaskInput: (input: string) => void;
  newTaskType: TypedColumn;
  setNewTaskType: (columnId: TypedColumn) => void;
  image: File | null;
  setImage: (image: File | null) => void;
  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getTodosGroupedByColumn();

    set({ board });
  },
  //
  updateColumnOrder: (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (type === 'column') {
      const entries = structuredClone(
        Array.from(get().board.columns.entries())
      );

      const [sourceEntry] = entries.splice(source.index, 1);

      entries.splice(destination!.index, 0, sourceEntry);

      const rearrangedCols = new Map(entries);

      set({
        board: {
          columns: rearrangedCols,
        },
      });

      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const entries = Array.from(structuredClone(get().board.columns));

    const [startEntryKey, startEntryValue] =
      entries[Number(source.droppableId)];

    const newStartColumn: Column = {
      id: startEntryKey,
      todos: startEntryValue.todos,
    };

    const [endEntryKey, endEntryValue] =
      entries[Number(destination.droppableId)];

    const newEndColumn: Column = {
      id: endEntryKey,
      todos: endEntryValue.todos,
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

      const newColumns = new Map(structuredClone(get().board.columns));

      newColumns.set(newStartColumn.id, newColumn);

      const result: Todo[] = [];

      newColumns.forEach((column) => {
        result.push(...column.todos);
      });

      updateTodos(result)

      set({ board: { columns: newColumns } });
    } else {
      const newColumns = new Map(structuredClone(get().board.columns));

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

      updateTodos(result)

      set({ board: { columns: newColumns } });
    }
  },
  newTaskInput: '',
  newTaskType: 'todo',
  deleteTask: async (taskIndex, todo, id) => {
    const newCols = new Map(get().board.columns);

    newCols.get(id)?.todos.splice(taskIndex, 1);

    set({ board: { columns: newCols } });

    if (todo.image) {
      await storages.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
  setNewTaskInput: (input) => set({ newTaskInput: input }),
  setNewTaskType: (columnId) => set({ newTaskType: columnId }),
  image: null,
  setImage: (image: File | null) => set({ image }),
  addTask: async (todo, columnId, image?: File | null) => {
    let file: Image | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        ...(file && { image: JSON.stringify(file) }),
        index: get().board.columns.get(columnId)!.todos.length,
      }
    );

    set((state) => {
      const newCols = new Map(state.board.columns);

      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        index: get().board.columns.get(columnId)!.todos.length,
        ...(file && { image: file }),
      };

      const col = newCols.get(columnId);

      if (!col) {
        newCols.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newCols.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: {
          columns: newCols,
        },
        newTaskInput: '',
      };
    });
  },
}));
