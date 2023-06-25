import { storages } from '@/appwrite';

const getUrl = async (image: Image) => {
  const url = storages.getFilePreview(image.bucketId, image.fileId);
  return url;
};

export default getUrl;
