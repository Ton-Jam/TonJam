import React from "react";
import { Track } from "@/types";
import { TrackComments } from "./TrackComments";

interface CommentsSheetProps {
  track: Track | null;
  onClose?: () => void;
}

export const CommentsSheet: React.FC<CommentsSheetProps> = ({ track, onClose }) => {
  return <TrackComments track={track} onClose={onClose} />;
};

export default CommentsSheet;
