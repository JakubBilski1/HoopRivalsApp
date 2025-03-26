// app/(protected)/matches/MatchFilters.tsx

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MatchType, TeamSizeOption } from "@/types/Matches";

interface MatchFiltersProps {
  searchTerm: string;
  onSearchTermChange: (val: string) => void;

  filterMatchType: MatchType | "ALL";
  onFilterMatchTypeChange: (val: MatchType | "ALL") => void;

  filterTeamSize: TeamSizeOption | "ALL";
  onFilterTeamSizeChange: (val: TeamSizeOption | "ALL") => void;

  filterPlayer: string;
  onFilterPlayerChange: (val: string) => void;

  filterArena: string;
  onFilterArenaChange: (val: string) => void;

  filterDuration: string;
  onFilterDurationChange: (val: string) => void;

  sortByScoring: boolean;
  onSortByScoringChange: (val: boolean) => void;

  filterWinLose: "win" | "lose" | "ALL";
  onFilterWinLoseChange: (val: "win" | "lose" | "ALL") => void;
}

export function MatchFilters({
  searchTerm,
  onSearchTermChange,
  filterMatchType,
  onFilterMatchTypeChange,
  filterTeamSize,
  onFilterTeamSizeChange,
  filterPlayer,
  onFilterPlayerChange,
  filterArena,
  onFilterArenaChange,
  filterDuration,
  onFilterDurationChange,
  sortByScoring,
  onSortByScoringChange,
  filterWinLose,
  onFilterWinLoseChange,
}: MatchFiltersProps) {
  return (
    <div className="md:h-[83vh] md:w-1/4 bg-brand-dark p-4 overflow-auto rounded-md border">
      <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>

      <Input
        placeholder="Search matches..."
        className="bg-gray-800 border-gray-700 mb-4"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />

      {/* Match type filter */}
      <Label className="mt-2 mb-1">Match Type</Label>
      <Select
        value={filterMatchType}
        onValueChange={(value) => {
          onFilterMatchTypeChange(value as MatchType | "ALL");
        }}
      >
        <SelectTrigger className="bg-gray-800 border-gray-700 w-full mb-4">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="QUARTERS">Quarters</SelectItem>
          <SelectItem value="POINTS">Points to Win</SelectItem>
        </SelectContent>
      </Select>

      {/* Team size filter */}
      <Label className="mt-2 mb-1">Teams Type</Label>
      <Select
        value={filterTeamSize}
        onValueChange={(value) => onFilterTeamSizeChange(value as TeamSizeOption | "ALL")}
      >
        <SelectTrigger className="bg-gray-800 border-gray-700 w-full mb-4">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="1v1">1v1</SelectItem>
          <SelectItem value="2v2">2v2</SelectItem>
          <SelectItem value="3v3">3v3</SelectItem>
          <SelectItem value="4v4">4v4</SelectItem>
          <SelectItem value="5v5">5v5</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter by player */}
      <Label className="mt-2">Filter by Player</Label>
      <Input
        className="bg-gray-800 border-gray-700 mb-4"
        placeholder="Player nickname..."
        value={filterPlayer}
        onChange={(e) => onFilterPlayerChange(e.target.value)}
      />

      {/* Filter by arena */}
      <Label className="mt-2">Filter by Arena</Label>
      <Input
        className="bg-gray-800 border-gray-700 mb-4"
        placeholder="Arena name..."
        value={filterArena}
        onChange={(e) => onFilterArenaChange(e.target.value)}
      />

      {/* Filter by match duration */}
      <Label className="mt-2">Filter by Duration</Label>
      <Input
        className="bg-gray-800 border-gray-700 mb-4"
        type="number"
        placeholder="Minutes..."
        value={filterDuration}
        onChange={(e) => onFilterDurationChange(e.target.value)}
      />

      {/* Sort by scoring */}
      <div className="flex items-center mb-4">
        <Checkbox
          id="sortByScoring"
          checked={sortByScoring}
          onCheckedChange={(checked) => onSortByScoringChange(Boolean(checked))}
          className="mr-2"
        />
        <Label htmlFor="sortByScoring" className="text-sm">
          Sort by Most Scoring Games
        </Label>
      </div>

      {/* Win/Lose filter */}
      <Label className="mt-2 mb-1">Win or Lose</Label>
      <Select
        value={filterWinLose}
        onValueChange={(value) => onFilterWinLoseChange(value as "win" | "lose" | "ALL")}
      >
        <SelectTrigger className="bg-gray-800 border-gray-700 w-full mb-4">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="win">Win</SelectItem>
          <SelectItem value="lose">Lose</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
