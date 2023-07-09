import { create } from 'zustand';
import { DropResult } from 'react-beautiful-dnd';

import { ID, databases, storages } from '@/appwrite';
import {
  getTodosGroupedByColumn,
  getTodosGroupedByColumnV2,
} from '@/lib/getTodosGroupedByColumn';
import uploadImage from '@/lib/uploadImage';
import updateTodos from '@/lib/updateTodos';

interface BoardState {
  columns: Map<TypedColumn, Column>;
  getColumns: () => void;
  setColumns: (result: DropResult) => void;
  newTaskInput: string;
  newTaskType: TypedColumn;
  image: File | null;
  setNewTaskInput: (input: string) => void;
  setNewTaskType: (columnId: TypedColumn) => void;
  setImage: (image: File | null) => void;
  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;
  deleteTask: (taskIndex: number, todo: Todo, id: TypedColumn) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: new Map<TypedColumn, Column>(),
  getColumns: async () => {
    const columns = await getTodosGroupedByColumn();

    set({ columns });
  },
  setColumns: (result) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (type === 'column') {
      const entries = structuredClone(Array.from(get().columns.entries()));

      const [sourceEntry] = entries.splice(source.index, 1);

      entries.splice(destination!.index, 0, sourceEntry);

      const rearrangedCols = new Map(entries);

      set({ columns: rearrangedCols });

      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const entries = Array.from(structuredClone(get().columns));

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

      const newColumns = new Map(structuredClone(get().columns));

      newColumns.set(newStartColumn.id, newColumn);

      const result: Todo[] = [];

      newColumns.forEach((column) => {
        result.push(...column.todos);
      });

      updateTodos(result);

      set({ columns: newColumns });
    } else {
      const newColumns = new Map(structuredClone(get().columns));

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

      updateTodos(result);

      set({ columns: newColumns });
    }
  },
  newTaskInput: '',
  newTaskType: 'todo',
  image: null,
  setNewTaskInput: (input) => set({ newTaskInput: input }),
  setNewTaskType: (columnId) => set({ newTaskType: columnId }),
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
        index: get().columns.get(columnId)!.todos.length,
      }
    );

    set((state) => {
      const newCols = new Map(state.columns);

      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        index: get().columns.get(columnId)!.todos.length,
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
        columns: newCols,
        newTaskInput: '',
      };
    });
  },
  deleteTask: async (taskIndex, todo, id) => {
    const newCols = new Map(get().columns);

    newCols.get(id)?.todos.splice(taskIndex, 1);

    set({ columns: newCols });

    if (todo.image) {
      await storages.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
}));
