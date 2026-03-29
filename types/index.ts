export interface Card {
  front: string;
  back: string;
  explanation?: string;
  hint?: string;
}

export interface Folder {
  id: string;
  name: string;
  emoji?: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  cards: Card[];
  createdAt: string;
  colorIndex: number;
  folderId?: string;
}

// JSON upload can be a full lesson object or just an array of cards
export type UploadPayload =
  | {
      title: string;
      description?: string;
      emoji?: string;
      cards: Card[];
    }
  | Card[];
