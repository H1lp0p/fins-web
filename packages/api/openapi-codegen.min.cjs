/** @type {import("@rtk-query/codegen-openapi").ConfigFile} */
module.exports = {
  schemaFile: "./test-min-openapi.yaml",
  apiFile: "./src/generated/public/emptyPublicApi.ts",
  apiImport: "api",
  exportName: "minApi",
  outputFile: "./src/generated/public/min.generated.ts",
  hooks: true,
  esmExtensions: true,
};
