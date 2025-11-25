import { Users, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export interface Mission {
  id: number;
  text: string;
  completed: boolean;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  missions: Mission[];
  color: string;
}

interface GroupMissionsProps {
  group: Group;
  onToggleMission: (groupId: string, missionId: number) => void;
  onMission1Click?: (groupId: string) => void;
}

export function GroupMissions({
  group,
  onToggleMission,
  onMission1Click,
}: GroupMissionsProps) {
  const completedCount = group.missions.filter((m) => m.completed).length;
  const totalCount = group.missions.length;
  const progress = (completedCount / totalCount) * 100;

  // Check if mission 1 is completed
  const mission1Completed =
    group.missions.find((m) => m.id === 1)?.completed ?? false;

  // Helper function to check if a mission is enabled
  const isMissionEnabled = (missionId: number) => {
    if (missionId === 1) return true; // Mission 1 is always enabled
    // Mission 2 and 3 require mission 1 to be completed
    return mission1Completed;
  };

  return (
    <Card
      className="h-full border-t-4 shadow-md"
      style={{ borderTopColor: group.color }}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{group.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-3 h-3" />
              {group.members.join(", ")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {completedCount} / {totalCount} 완료
          </Badge>
        </div>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          미션 목록
        </div>
        <div className="space-y-3">
          {group.missions.map((mission, index) => {
            const isEnabled = isMissionEnabled(mission.id);
            return (
              <div
                key={mission.id}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  mission.completed
                    ? "bg-green-50"
                    : isEnabled
                    ? "bg-gray-50 hover:bg-gray-100"
                    : "bg-gray-50 opacity-50"
                }`}
              >
                <Checkbox
                  id={`mission-${group.id}-${mission.id}`}
                  checked={mission.completed}
                  disabled={!isEnabled}
                  onCheckedChange={() => {
                    if (
                      mission.id === 1 &&
                      !mission.completed &&
                      onMission1Click
                    ) {
                      onMission1Click(group.id);
                    } else {
                      onToggleMission(group.id, mission.id);
                    }
                  }}
                  className="mt-0.5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor={`mission-${group.id}-${mission.id}`}
                  className={`text-sm font-medium leading-snug select-none ${
                    !isEnabled
                      ? "text-gray-400 cursor-not-allowed"
                      : mission.completed
                      ? "text-green-700 line-through decoration-2 decoration-green-700/50 cursor-pointer"
                      : "text-gray-700 cursor-pointer"
                  }`}
                >
                  {!isEnabled
                    ? "🔒 ???: (미션 1 완료 후 공개)"
                    : `미션 ${index + 1}: ${mission.text}`}
                </label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
