import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:partipantId",
    {
      schema: {
        params: z.object({
          partipantId: z.uuid(),
        }),
      },
    },
    async (request) => {
      const { partipantId } = request.params;

      const participant = await prisma.participants.findUnique({
        where: { id: partipantId },
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
      });

      if (!participant) {
        throw new ClientError("Participant not found.");
      }

      return { participant: participant };
    }
  );
}
