import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import { dayjs } from "../lib/dayjs";
import nodemailer from "nodemailer";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invite",
    {
      schema: {
        params: z.object({
          tripId: z.uuid(),
        }),
        body: z.object({
          email: z.email(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new Error("Trip not found.");
      }

      const participant = await prisma.participants.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient();

      const confirmationLink = `http://localhost:3000/participants/${participant.id}/confirm`;
      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "planner@gmail.com",
        },
        to: participant.email,
        subject: `Confirme sua presença para ${trip.destination} em ${formattedStartDate}`,
        html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
            <p>
              Você você foi convidade para participar de uma viagem para
              <strong>${trip.destination}</strong> nas datas de
              <strong> ${formattedStartDate}</strong> até  <strong>${formattedEndDate}. </strong>
            </p>
            <p>Para sua presença na viagem, clique no link abaixo:</p>
            <a href="${confirmationLink}"> Confirmar viagem </a>
            <p></p>
            <p>
              Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.
              plann.er
            </p>
          </div>
          `.trim(),
      });

      const emilLink = nodemailer.getTestMessageUrl(message);
      console.log(emilLink);

      return { participantId: participant.id };
    }
  );
}
