export interface BackgroundRequest {
  type: RequestType,
  tabs?: number[]
}

export enum RequestType {
  QUERY_TABS,
  CLOSE_TABS
}