/** @type {import("@rtk-query/codegen-openapi").ConfigFile} */
module.exports = {
  schemaFile: "./openapi-bundle/public.bundle.yaml",
  apiFile: "./src/generated/public/emptyPublicApi.ts",
  apiImport: "emptySplitApi",
  exportName: "generatedPublicApi",
  outputFile: "./src/generated/public/generatedPublicApi.ts",
  hooks: true,
  tag: true,
};
