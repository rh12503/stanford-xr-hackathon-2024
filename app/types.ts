import { CSSProperties } from "react";

export interface ScheduleItem {
  time: string;
  location: string;
  url: string;
  description: string;
}

export interface Sponsor {
  name: string;
  imgsrc: string;
}

export interface SponsorTier {
  tier: string;
  style: CSSProperties;
  sponsors: Sponsor[];
}
