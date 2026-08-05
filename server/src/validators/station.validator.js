import { z } from "zod";

export const createStationSchema = z.object({
  name: z.string().min(1, "Station name is required"),
  brand: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
});

export const updateStationSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().optional(),
  address: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isVerified: z.boolean().optional(),
});
