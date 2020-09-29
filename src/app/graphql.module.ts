import { NgModule } from "@angular/core";
import { ApolloModule, APOLLO_OPTIONS } from "apollo-angular";
import { HttpLinkModule, HttpLink } from "apollo-angular-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { environment } from "../environments/environment";

export function createApollo(httpLink: HttpLink) {
  return {
    //db_url_test for Inndata Test Server
    //db_url_live for Ale Test Server
    //db_url_local for local code
    //db_url_old for Old Server
    link: httpLink.create({ uri: environment.db.db_url_live }),
    cache: new InMemoryCache({
      addTypename: false,
    }),
    // CORs disabled - corss platforms
    fetchOptions: {
      mode: "no-cors",
    },
    // end of CORs disabled - corss platforms
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
