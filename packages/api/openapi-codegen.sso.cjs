/** @type {import("@rtk-query/codegen-openapi").ConfigFile} */
module.exports = {
  schemaFile: "../../openapi/openApi.sso.yaml",
  apiFile: "./src/generated/sso/emptySsoApi.ts",
  apiImport: "api",
  exportName: "ssoBffApi",
  outputFile: "./src/generated/sso/ssoBffApi.generated.ts",
  hooks: { queries: true, lazyQueries: false, mutations: true },
  tag: true,
  esmExtensions: true,
};
