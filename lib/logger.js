import { createLogger, transports } from "winston";

export const logger = createLogger({
  level: "info",
  transports: [new transports.Console()],
});
