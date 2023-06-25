'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from 'react-beautiful-dnd';
import { XCircleIcon } from '@heroicons/react/24/solid';

import getUrl from '@/lib/getUrl';
import { useBoardStore } from '@/store/BoardStore';

type Props = {
  todo: Todo;
  innerRef: (element: HTMLElement | null) => void;
  index: number;
  id: TypedColumn;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
};

const TodoCard = ({
  todo,
  innerRef,
  index,
  id,
  dragHandleProps,
  draggableProps,
}: Props) => {
  const { deleteTask } = useBoardStore((state) => state);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (todo.image) {
        const url = await getUrl(todo.image);

        if (url) {
          setImageUrl(url.toString());
        }
      }
    };

    fetchImage();
  }, [todo]);

  const handleDeleteTask = () => {
    deleteTask(index, todo, id);
  };

  return (
    <div
      {...dragHandleProps}
      {...draggableProps}
      className="bg-white rounded-md space-y-2 drop-shadow-md"
      ref={innerRef}
    >
      <div className="flex justify-between items-center p-5">
        <p>{todo.title}</p>
        <button
          className="text-red-500 hover:text-red-600"
          onClick={handleDeleteTask}
        >
          <XCircleIcon className="ml-5 h-8 w-8" />
        </button>
      </div>
      {imageUrl && (
        <div className="h-full w-full rounded-b-md">
          <Image
            src={imageUrl}
            alt="Task image"
            width={400}
            height={200}
            className="w-full object-contain rounded-b-md"
          />
        </div>
      )}
    </div>
  );
};

export default TodoCard;
