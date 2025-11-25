import React from 'react';
import { Check, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

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
}

export function GroupMissions({ group, onToggleMission }: GroupMissionsProps) {
  const completedCount = group.missions.filter(m => m.completed).length;
  const totalCount = group.missions.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <Card className="h-full border-t-4 shadow-md" style={{ borderTopColor: group.color }}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{group.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-3 h-3" />
              {group.members.join(', ')}
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
          {group.missions.map((mission) => (
            <div 
              key={mission.id} 
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${mission.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <Checkbox 
                id={`mission-${group.id}-${mission.id}`}
                checked={mission.completed}
                onCheckedChange={() => onToggleMission(group.id, mission.id)}
                className="mt-0.5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <label
                htmlFor={`mission-${group.id}-${mission.id}`}
                className={`text-sm font-medium leading-snug cursor-pointer select-none ${mission.completed ? 'text-green-700 line-through decoration-2 decoration-green-700/50' : 'text-gray-700'}`}
              >
                {mission.text}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
