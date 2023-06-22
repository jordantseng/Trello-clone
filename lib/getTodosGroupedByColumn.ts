import { databases } from '@/appwrite';

export const getTodosGroupedByColumn = async () => {
  const data = await databases.listDocuments(
    process.env.NEXT_PUBLIC_DATABASE_ID!,
    process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!
  );

  const todos = data.documents;

  const columns = todos.reduce(
    (acc, todo) => {
      acc.get(todo.status)?.todos.push({
        $id: todo.$id,
        $createdAt: todo.$createdAt,
        status: todo.status,
        title: todo.title,
        ...(todo.image && { image: JSON.parse(todo.image) }),
      });

      return acc;
    },
    new Map<TypedColumn, Column>([
      ['todo', { id: 'todo', todos: [] }],
      ['inprogress', { id: 'inprogress', todos: [] }],
      ['done', { id: 'done', todos: [] }],
    ])
  );

  console.log(columns);

  return columns;
};
