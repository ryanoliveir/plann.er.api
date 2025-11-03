import type { FastifyInstance } from "fastify";
import { ClientError } from "./errors/client-error";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { treeifyError, ZodError, z } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];
//https://zod.dev/error-formatting?id=zformaterror

export const erroHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Invalid input",
      // errors: z.flattenError(error),
      // errors: z.prettifyError(error),
      // errors: z.formatError(error),
      errors: z.flattenError(error),
    });
  }

  if (error instanceof ClientError) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  return reply.status(500).send({ message: "Internal server error" });
};
