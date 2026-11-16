import { createElement, useState } from "react";
import { ImageViewer } from "../components/ui.jsx";

// Mount only while open so Escape unmounts the dialog and restores its trigger.
export function useImageViewer() {
  const [image, setImage] = useState(null);
  const viewer = image
    ? createElement(ImageViewer, { image, onClose: () => setImage(null) })
    : null;
  return [viewer, setImage];
}
