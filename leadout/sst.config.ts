import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "leadout",
      region: "us-east-2",
      profile: "dev",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "nodejs18.x",
      architecture: "arm_64",
    })

    app
      .stack(API)
  },
} satisfies SSTConfig;
