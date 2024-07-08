export interface Word {
  confidence: number;
  end: number;
  speaker: string;
  start: number;
  text: string;
}

export interface Message {
  confidence: number;
  end: number;
  speaker: string;
  start: number;
  text: string;
  words: Word[];
}
