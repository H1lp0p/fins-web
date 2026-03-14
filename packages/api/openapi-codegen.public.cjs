/** @type {import("@rtk-query/codegen-openapi").ConfigFile} */
module.exports = {
  schemaFile: "../../openapi/openApi.public.yaml",
  apiFile: "./src/generated/public/emptyPublicApi.ts",
  apiImport: "api",
  exportName: "publicBffApi",
  outputFile: "./src/generated/public/publicBffApi.generated.ts",
  hooks: { queries: true, lazyQueries: false, mutations: true },
  tag: true,
  esmExtensions: true,
};
