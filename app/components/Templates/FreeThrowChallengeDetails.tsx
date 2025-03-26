import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash, Pen } from "lucide-react";

type Badges = {
  badgeName: string;
  badgeColor:
    | "default"
    | "best"
    | "secondBest"
    | "thirdBest"
    | "worst"
    | "secondary"
    | "destructive"
    | "outline";
  badgeIcon: string;
};

type FreeThrows = {
  id: number;
  challengeId: number;
  shotsMade: number;
  shotsTaken: number;
};

type FreeThrowsBadges = FreeThrows & Badges;

type FreeThrowChallengeDetailsProps = FreeThrowsBadges & {
  onRemove?: (challengeId: number) => void;
  onUpdate?: (challengeId: number) => void;
};

export const FreeThrowChallengeDetails = ({
  id,
  shotsMade,
  shotsTaken,
  badgeColor,
  badgeIcon,
  badgeName,
  onRemove,
  onUpdate,
}: FreeThrowChallengeDetailsProps) => {
  const percentEfficiency =
    shotsTaken > 0 ? Math.round((shotsMade / shotsTaken) * 100) : 0;

  return (
    <Card className="bg-gray-800 text-white">
      <CardHeader className="border-b flex justify-between items-center">
        <CardTitle className="text-xl font-bold">
          {shotsTaken} Free Throws
        </CardTitle>
        <div className="flex gap-2 flex-col">
          {onUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate(id)}
            >
              <Pen className="h-4 w-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-1">
          <p className="text-sm text-white">
            Shots Made: <span className="font-bold">{shotsMade}</span>
          </p>
          <p className="text-sm text-white">
            Shots Taken: <span className="font-bold">{shotsTaken}</span>
          </p>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Efficiency: {percentEfficiency}%
          </span>
          <Badge variant={badgeColor}>
            {badgeIcon} {badgeName}
          </Badge>
        </div>
        <Progress value={percentEfficiency} />
      </CardContent>
    </Card>
  );
};
