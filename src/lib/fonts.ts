import { DM_Sans, Instrument_Serif } from "next/font/google";

export const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const sans = DM_Sans({
  weight: "variable",
  axes: ["opsz"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const fontVariables = `${serif.variable} ${sans.variable}`;
