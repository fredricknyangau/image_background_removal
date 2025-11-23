// Download utility functions
export const downloadImage = (
  imageUrl: string,
  filename: string = "background-removed.png"
) => {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
