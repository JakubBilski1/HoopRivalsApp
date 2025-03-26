"use client";

import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ButtonLoading from "@/app/button-loading"

import { Match, MatchParams } from "@/types/Matches";
import { Arena } from "@prisma/client";

interface EditMatchDialogProps {
  editingMatch: Match | null; // if present, dialog is open
  newMatch: MatchParams;
  onNewMatchChange: (val: MatchParams) => void;
  onClose: () => void;
  onUpdateMatch: () => Promise<void>;
  arenas: Arena[];
}

export function EditMatchDialog({
  editingMatch,
  newMatch,
  onNewMatchChange,
  onClose,
  onUpdateMatch,
  arenas,
}: EditMatchDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateMatch = async () => {
    setIsUpdating(true);
    await onUpdateMatch();
    setIsUpdating(false);
  };

  return (
    <Dialog open={!!editingMatch} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-brand-dark text-white border-0">
        <DialogTitle className="text-white">Edit Match</DialogTitle>
        <div className="space-y-4">
          {/* Date Field */}
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              className="bg-gray-800 border-gray-700"
              value={newMatch.date}
              onChange={(e) =>
                onNewMatchChange({ ...newMatch, date: e.target.value })
              }
            />
          </div>

          {/* Arena Field */}
          <div>
            <Label>Arena</Label>
            <Select
              value={newMatch.arenaId ? newMatch.arenaId.toString() : ""}
              onValueChange={(value) =>
                onNewMatchChange({ ...newMatch, arenaId: Number(value) })
              }
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 w-full mt-1">
                <SelectValue placeholder="Select arena" />
              </SelectTrigger>
              <SelectContent>
                {arenas.map((arena) => (
                  <SelectItem key={arena.id} value={arena.id.toString()}>
                    {arena.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="bg-brand-orange hover:bg-orange-500"
            onClick={handleUpdateMatch}
            disabled={isUpdating}
          >
            {isUpdating ? <ButtonLoading /> : "Update Match"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}