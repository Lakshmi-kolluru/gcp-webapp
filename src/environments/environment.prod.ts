export const environment = {
  production: true,
  test: "test",

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
      "596882210033-4ig8e1vspt3mpehlfgo37n59tjdhn9tu.apps.googleusercontent.com",
    key: "wQUQ0UbdEs9V5Kzu4Q9joI_a",
  },
};
