import { create } from 'zustand';

import { ID, databases, storages } from '@/appwrite';
import { getTodosGroupedByColumn } from '@/lib/getTodosGroupedByColumn';
import uploadImage from '@/lib/uploadImage';

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodoOrder: (todos: Todo[]) => void;
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
  setBoardState: (board) => set({ board }),
  updateTodoOrder: async (todos) => {
    for (const todo of todos) {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
        todo.$id,
        {
          ...todo,
        }
      );
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
