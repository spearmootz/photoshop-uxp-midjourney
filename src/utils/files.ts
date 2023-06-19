import { storage } from "uxp";

export const getFileExtensionsThatDontHaveMatchingExtension = (
  entries: storage.Entry[],
  wantedExtension: string,
  matchingExtension?: string
): storage.Entry[] => {
  const entryDictionary: {
    [index: string]: { entry?: storage.Entry; matchingExtension?: boolean };
  } = {};

  entries.forEach((entry) => {
    const fileNameParts = entry.name.split(".");
    const extension = fileNameParts.pop();
    const fileName = fileNameParts.join(".");

    if (!entryDictionary[fileName]) {
      entryDictionary[fileName] = {
        matchingExtension: false,
      };
    }

    const record = entryDictionary[fileName];

    if (extension == wantedExtension) {
      record.entry = entry;
    } else if (extension == matchingExtension) {
      record.matchingExtension = true;
    }
  });

  // @ts-expect-error does not know this filters null
  return Object.values(entryDictionary)
    .filter((entry) => entry.matchingExtension == false && entry.entry)
    .map((entry) => entry.entry);
};
