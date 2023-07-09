import { databases } from '@/appwrite';

const updateTodos = async (todos: Todo[]) => {
  for (const todo of todos) {
    const { image } = todo;
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        ...todo,
        ...(image && { image: JSON.stringify(image) }),
      }
    );
  }
};

export default updateTodos;
