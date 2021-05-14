import path from "path";
import fs from "fs";

export const getAllMaterialLinks = () => {
  const resources = path.join(__dirname, "../../files/materials/");
  const folders = fs.readdirSync(resources);
  const models = folders
    .filter((folder) => {
      const newPath = path.join(resources, folder);
      return fs.statSync(newPath).isDirectory();
    })
    .map((a) => `/material/${a}`);

  return models;
};

export default function handler(req, res) {
  const paths = getAllMaterialLinks();

  res.status(200).json(paths);
}
