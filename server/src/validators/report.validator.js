import { z } from "zod";

export const createReportSchema = z.object({
  stationId: z.string().uuid("Invalid station ID format"),
  fuelType: z.enum(["PMS", "AGO", "DPK", "LPG"], {
    errorMap: () => ({ message: "Fuel type must be PMS, AGO, DPK, or LPG" }),
  }),
  price: z.number().positive("Price must be a positive number"),
  available: z.boolean().optional().default(true),
});
