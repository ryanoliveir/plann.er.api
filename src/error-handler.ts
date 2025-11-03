import type { FastifyInstance } from "fastify";
import { ClientError } from "./errors/client-error";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { treeifyError, ZodError } from "zod/v4";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const erroHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Invalid input",
      errors: error,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: error.message,
      errors: treeifyError(error),
    });
  }

  if (error instanceof ClientError) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  return reply.status(500).send({ message: "Internal server error" });
};
