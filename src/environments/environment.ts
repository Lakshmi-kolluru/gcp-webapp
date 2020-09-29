// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.

/* import { writeFile } from "fs";

// Configure Angular `environment.ts` file path
const targetPath = "./src/environments/environment.ts";
// Load node modules
const colors = require("colors");
require("dotenv").load();
// `environment.ts` file structure
const envConfigFile = `export const environment = {
   apiBaseUrl: '${process.env.API_BASE_URL}',
   apiUrl: '${process.env.API_URL}',
   appName: '${process.env.APP_NAME}',
   awsPubKey: '${process.env.AWSKEY}',
   nodeEnv: '${process.env.NODE_ENV}',
   production: '${process.env.PRODUCTION}'
};
`;
console.log(
  colors.magenta(
    "The file `environment.ts` will be written with the following content: \n"
  )
);
console.log(colors.grey(envConfigFile));
writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      colors.magenta(
        `Angular environment.ts file generated correctly at ${targetPath} \n`
      )
    );
  }
});
// The list of file replacements can be found in `angular.json`. */

export const environment = {
  production: false,

  db: {
    db_url_local: "http://localhost:8000/api/graphql",
    db_url_old: "http://vesta-server.cloud.biodata.ro/api/graphql ",
    db_url_test:
      "https://vesta-api-server-dev-vesta.4b63.pro-ap-southeast-2.openshiftapps.com/api/graphql",
    db_url_live:
      "https://vesta-api-server-vestabeta.b9ad.pro-us-east-1.openshiftapps.com/api/graphql",
    /*  db_url_live:
      "http://vesta-api-server-vestabeta.b9ad.pro-us-east-1.openshiftapps.com/api/graphql", */
  },
  stripe: {
    publishable_Key:
      "pk_live_518le7UBqL9pyKYZl8A1YXj8H6BrtNPg40Ppj3ruO78XLIjatVDCa4WStLxaoSfZ87NdyVylhXI7EaPf28J5WTUmv00hVA2taIX",
  },
  google: {
    id:
      "987292819820-uhpoonllftr898nleev925p9d20lt9qh.apps.googleusercontent.com",
    key: "H2hH1HVt_rO__zdBVsDCQRh_",
  },
};
