import { z } from "zod";
import { pt } from "zod/locales";
z.config(pt());

export const createInstitutionalContentSchema = z.object({
  aboutTitle: z.string(),
  aboutText: z.string(),
  whoWeAreTitle: z.string(),
  whoWeAreText: z.string(),
  purposeTitle: z.string(),
  purposeText: z.string(),
  mission: z.string(),
  vision: z.string(),
  valuesJson: z.string(),
});

export const updateInstitutionalContentSchema = z.object({
  aboutTitle: z.string().optional(),
  aboutText: z.string().optional(),
  whoWeAreTitle: z.string().optional(),
  whoWeAreText: z.string().optional(),
  purposeTitle: z.string().optional(),
  purposeText: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  valuesJson: z.string().optional(),
});
