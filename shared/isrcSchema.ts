import { z } from 'zod';

// Songwriter/Author schema (lyrics writers)
export const songwriterSchema = z.object({
  referenceNumber: z.number().min(1),
  name: z.string().min(1, "Songwriter name is required"),
  address: z.string().min(1, "Address is required"),
  proAffiliation: z.string().min(1, "PRO affiliation is required"),
  lyricsOwnership: z.number().min(0).max(50).default(50), // Default 50% for authors/songwriters
  email: z.string().email().optional(),
  ipiNumber: z.string().optional()
});

// Melody creator schema
export const melodyCreatorSchema = z.object({
  referenceNumber: z.number().min(1),
  name: z.string().min(1, "Melody creator name is required"),
  address: z.string().min(1, "Address is required"),
  proAffiliation: z.string().min(1, "PRO affiliation is required"),
  melodyOwnership: z.number().min(0).max(25).default(25), // Default 25% for melody creators
  email: z.string().email().optional(),
  ipiNumber: z.string().optional()
});

// Beat/Production creator schema
export const beatCreatorSchema = z.object({
  referenceNumber: z.number().min(1),
  name: z.string().min(1, "Beat/Producer name is required"),
  address: z.string().min(1, "Address is required"),
  proAffiliation: z.string().min(1, "PRO affiliation is required"),
  beatOwnership: z.number().min(0).max(25).default(25), // Default 25% for beat/production creators
  email: z.string().email().optional(),
  ipiNumber: z.string().optional()
});

// Recording artist schema (performers)
export const recordingArtistSchema = z.object({
  referenceNumber: z.number().min(1),
  name: z.string().min(1, "Artist name is required"),
  address: z.string().min(1, "Address is required"),
  proAffiliation: z.string().min(1, "PRO affiliation is required"),
  email: z.string().email().optional(),
  ipiNumber: z.string().optional()
});

// Label schema
export const labelSchema = z.object({
  referenceNumber: z.number().min(1),
  name: z.string().min(1, "Label name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  proAffiliation: z.string().min(1, "PRO affiliation is required")
});

// Studio schema
export const studioSchema = z.object({
  referenceNumber: z.number().min(1),
  name: z.string().min(1, "Studio name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional()
});

// Publisher schema - Default 100% to Wai'tuMusic unless songwriter represented by other PRO
export const publisherSchema = z.object({
  referenceNumber: z.number().min(1),
  name: z.string().min(1, "Publisher name is required").default("Wai'tuMusic"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  proAffiliation: z.string().min(1, "PRO affiliation is required").default("ASCAP"),
  publishingPercentage: z.number().min(0).max(100).default(100), // Default 100% to Wai'tuMusic
  email: z.string().email().optional()
});

// Complete splitsheet form schema with Wai'tuMusic policy defaults
export const splitsheetFormSchema = z.object({
  songTitle: z.string().min(1, "Song title is required"),
  songReference: z.string().min(1, "Song reference is required"),
  
  // Composition side (must total 100%)
  songwriters: z.array(songwriterSchema).min(1, "At least one songwriter/author is required"),
  melodyCreators: z.array(melodyCreatorSchema).optional(),
  beatCreators: z.array(beatCreatorSchema).optional(),
  
  // Performance side
  recordingArtists: z.array(recordingArtistSchema).min(1, "At least one recording artist is required"),
  labels: z.array(labelSchema).min(1, "At least one label is required"),
  studios: z.array(studioSchema).optional(),
  
  // Publishing side (default 100% to Wai'tuMusic)
  publishers: z.array(publisherSchema).optional().default([{
    referenceNumber: 1,
    name: "Wai'tuMusic",
    address: "123 Music Street, Music City, MC 12345",
    proAffiliation: "ASCAP",
    publishingPercentage: 100,
    email: "publishing@waitumusic.com"
  }])
}).refine((data) => {
  // Validate composition percentages total 100%
  const totalComposition = 
    data.songwriters.reduce((sum, sw) => sum + sw.lyricsOwnership, 0) +
    (data.melodyCreators || []).reduce((sum, mc) => sum + mc.melodyOwnership, 0) +
    (data.beatCreators || []).reduce((sum, bc) => sum + bc.beatOwnership, 0);
  return Math.abs(totalComposition - 100) < 0.01; // Allow for floating point precision
}, {
  message: "Composition percentages must total exactly 100% (Songwriters: 50%, Melody: 25%, Beat/Production: 25%)",
  path: ["songwriters"]
}).refine((data) => {
  // Validate publishing percentages total 100%
  const totalPublishing = (data.publishers || []).reduce((sum, pub) => sum + pub.publishingPercentage, 0);
  return Math.abs(totalPublishing - 100) < 0.01;
}, {
  message: "Publishing percentages must total exactly 100%",
  path: ["publishers"]
});

export type SplitsheetFormData = z.infer<typeof splitsheetFormSchema>;
export type SongwriterData = z.infer<typeof songwriterSchema>;
export type MelodyCreatorData = z.infer<typeof melodyCreatorSchema>;
export type BeatCreatorData = z.infer<typeof beatCreatorSchema>;
export type RecordingArtistData = z.infer<typeof recordingArtistSchema>;
export type LabelData = z.infer<typeof labelSchema>;
export type StudioData = z.infer<typeof studioSchema>;
export type PublisherData = z.infer<typeof publisherSchema>;