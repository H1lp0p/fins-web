/** @type {import("@rtk-query/codegen-openapi").ConfigFile} */
module.exports = {
  schemaFile: "./openapi-bundle/sso.bundle.yaml",
  apiFile: "./src/generated/sso/emptySsoApi.ts",
  apiImport: "emptySplitApi",
  exportName: "generatedSsoApi",
  outputFile: "./src/generated/sso/generatedSsoApi.ts",
  hooks: true,
  tag: true,
};
