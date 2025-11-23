// Service for calling the FastAPI backend
export default async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/remove-background", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to process image");
  }

  return await response.blob();
};
