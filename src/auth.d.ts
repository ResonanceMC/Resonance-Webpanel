import Vue from "vue";
import { AuthInterface } from "@/helpers/auth";

declare module "vue/types/vue" {
  interface Vue {
    $auth: AuthInterface;
  }
}
