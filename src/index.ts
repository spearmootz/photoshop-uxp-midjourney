import { app, core } from "photoshop";
import { Document } from "photoshop/dom/Document";
import { Layer } from "photoshop/dom/Layer";
import { storage } from "uxp";
import { removeBackground } from "./utils/actions";

const fs = storage.localFileSystem;

const resizeMethod = {
  undefined: undefined,
  preserveDetails: "deepUpscale",
};

// CONFIGURATION
const configuration = {
  removeBackground: false,
  resizeDocument: {
    widthInPixels: 5000,
    dpi: 300,
    method: resizeMethod.undefined, // resizeMethod.preserveDetails,
    reduceNoise: 20,
  },
};

const showAlert = (message: string) => {
  return core.showAlert({ message });
};

const resizeDocument = async (document: Document) => {
  await document.resizeImage(
    configuration.resizeDocument.widthInPixels,
    undefined,
    configuration.resizeDocument.dpi,
    // @ts-ignore
    configuration.resizeDocument.method,
    configuration.resizeDocument.reduceNoise
  );
};

const saveAllPhotos = async (document: Document) => {
  const layers = document.layers;

  //  document.path if we want the full thing
  const baseName = document.name.split(".").slice(0, -1).join(".");
  let i = 1;
  for (const layer of layers) {
    layer.visible = true;

    const path = `${baseName}_${i}.png`;

    const entry = await fs.getFileForSaving(path, {
      types: ["png"],
    });

    await document.saveAs.png(entry);

    layer.visible = false;
    i++;
  }

  const entry = await fs.getFileForSaving(`${baseName}.psd`, {
    types: ["psd"],
  });

  await document.saveAs.psd(entry);
};

const duplicateLayersAndDeleteOriginalLayer = async (
  document: Document,
  numberOfLayers = 4
) => {
  const layers: Layer[] = [];
  const backgroundLayer = document.layers[0];
  const xDimension = document.width / 2;
  const yDimension = document.height / 2;

  while (layers.length < numberOfLayers) {
    const [layer] = await document.duplicateLayers([backgroundLayer]);
    layers.push(layer);

    const x = layers.length;
    const xCoordinates = x % 2 == 1 ? 0 : xDimension;
    const yCoordinates = x / 2 <= 1 ? 0 : yDimension;

    await layer.translate(xCoordinates * -1, yCoordinates * -1);

    if (configuration.removeBackground) {
      await removeBackground();
    }

    layer.visible = false;
  }

  await backgroundLayer.delete();

  // @ts-ignore
  await document.crop({
    left: 0,
    right: xDimension,
    top: 0,
    bottom: yDimension,
  });

  return layers;
};

const run = async () => {
  const selectedFiles = await fs.getFileForOpening({
    types: [...storage.fileTypes.images, "*"],
    allowMultiple: true,
  });

  if (!Array.isArray(selectedFiles)) {
    await showAlert("No file was selected.");
    return;
  }

  for (const file of selectedFiles) {
    const document = await app.open(file);

    await duplicateLayersAndDeleteOriginalLayer(document, 4);

    await resizeDocument(document);

    await saveAllPhotos(document);

    await document.closeWithoutSaving();
  }
};

try {
  await core.executeAsModal(run, {
    commandName: "my script",
  });
} catch (error: unknown) {
  debugger;
}
