import React from "react";
import { trimEnd } from "../../../utils/strings";
import { OpenAPI } from "../../backend";

interface Props {
  endpoint: string;
  token?: string;
  children: any;
}

const ApiProvider = ({ children, token, endpoint }: Props) => {
  OpenAPI.BASE = trimEnd(endpoint, "/");
  OpenAPI.TOKEN = token;

  return <>{children}</>;
};

export default ApiProvider;
