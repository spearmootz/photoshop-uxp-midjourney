import { action } from "photoshop";

export const removeBackground = () => {
  return action.batchPlay(
    [
      {
        _obj: "removeBackground",
        _isCommand: true,
      },
    ],
    {}
  );
};
