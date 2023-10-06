import { useEffect, useState } from "react";

const usePressedKeys = () => {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const onKeyDown = (e: KeyboardEvent) => {
    setPressedKeys((prev) => new Set(prev).add(e.key));
  };

  const onKeyUp = (e: KeyboardEvent) => {
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(e.key);
      return newSet;
    });
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return pressedKeys;
};

export default usePressedKeys;
