"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Quarter } from "@/types/Matches";

interface AddQuartersSubDialogProps {
  open: boolean;
  onClose: () => void;
  quarters?: Quarter[];
  onQuartersChange: (newQuarters: Quarter[]) => void;
}

export function AddQuartersSubDialog({
  open,
  onClose,
  quarters,
  onQuartersChange,
}: AddQuartersSubDialogProps) {
  const [localQuarters, setLocalQuarters] = React.useState<Quarter[]>(quarters || []);

  React.useEffect(() => {
    setLocalQuarters(quarters || []);
  }, [quarters]);

  function handleSaveQuarters() {
    onQuartersChange(localQuarters);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-brand-dark text-white border-0 max-w-md w-full">
        <DialogTitle className="text-white">Edit Quarters</DialogTitle>

        <div className="grid grid-cols-1 gap-4 mt-2">
          {localQuarters.map((q, i) => (
            <div key={`quarter-${i}`} className="p-2 border border-gray-700 rounded">
              <p className="mb-2 text-sm text-gray-400">Quarter {q.number}</p>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                className="bg-gray-800 border-gray-700 mb-2"
                value={q.duration}
                onChange={(e) => {
                  const updated = [...localQuarters];
                  updated[i] = {
                    ...updated[i],
                    duration: Number(e.target.value),
                  };
                  setLocalQuarters(updated);
                }}
              />
              {/* Additional stats if desired */}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-brand-orange hover:bg-orange-500" onClick={handleSaveQuarters}>
            Save Quarters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
