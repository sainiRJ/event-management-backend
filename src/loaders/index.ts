import { Application } from "express";
import loadExpress from "./expressLoader";

const loader = async ({ expressApp }: { expressApp: Application }): Promise<void> => {
  // Loading express...
  await loadExpress({ app: expressApp });
  console.log("Express loaded");
};

export default loader;
