// app/(protected)/matches/MatchesList.tsx

"use client";

import * as React from "react";
import { Match } from "@/types/Matches";
import { MatchCard } from "../MatchCard";

interface MatchesListProps {
  matches: Match[];
  onDelete: (matchId: number) => void;
  onEdit: (match: Match) => void;
  fetchMatches: () => void;
}

export function MatchesList({ matches, onDelete, onEdit, fetchMatches }: MatchesListProps) {
  if (!matches.length) {
    return <p className="text-gray-400 col-span-full">No matches found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {matches.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          onDelete={onDelete}
          onEdit={onEdit}
          fetchMatches={fetchMatches}
        />
      ))}
    </div>
  );
}
