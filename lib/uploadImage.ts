import { ID, storages } from '@/appwrite';

const uploadImage = async (file: File) => {
  if (!file) {
    return;
  }

  const fileUploaded = await storages.createFile(
    process.env.NEXT_PUBLIC_BUCKET_ID!,
    ID.unique(),
    file
  );

  return fileUploaded;
};

export default uploadImage;
