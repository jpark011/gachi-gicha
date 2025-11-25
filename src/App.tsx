import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { MapDisplay } from './components/MapDisplay';
import { GroupMissions, Group } from './components/GroupMissions';
import { Timeline } from './components/Timeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 'A',
      name: '불국사 팀',
      members: ['지수', '현우', '민지', '준호'],
      color: '#ef4444', // red-500
      missions: [
        { id: 1, text: '첨성대에서 재미있는 단체 셀카 찍기', completed: false },
        { id: 2, text: '최고의 황남빵 찾아서 먹기', completed: false },
        { id: 3, text: '저녁 코드 퀴즈 우승하기', completed: false },
      ],
    },
    {
      id: 'B',
      name: '석굴암 팀',
      members: ['서연', '도윤', '하은', '우진'],
      color: '#3b82f6', // blue-500
      missions: [
        { id: 1, text: '동궁과 월지에서 10초 브이로그 찍기', completed: false },
        { id: 2, text: '만원 이하로 독특한 기념품 사기', completed: false },
        { id: 3, text: 'KTX에서 버그 픽스 커밋하기', completed: false },
      ],
    },
  ]);

  const [activeMapGroup, setActiveMapGroup] = useState('A');

  const handleToggleMission = (groupId: string, missionId: number) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          missions: group.missions.map(mission => 
            mission.id === missionId ? { ...mission, completed: !mission.completed } : mission
          )
        };
      }
      return group;
    }));
  };

  const mapLocations = {
    'A': [
      { id: 'A1', name: '첨성대', x: 45, y: 55 },
      { id: 'A2', name: '황남빵 맛집', x: 35, y: 50 },
      { id: 'A3', name: '퀴즈 행사장', x: 50, y: 60 },
    ],
    'B': [
      { id: 'B1', name: '동궁과 월지', x: 60, y: 40 },
      { id: 'B2', name: '기념품 가게', x: 38, y: 52 },
      { id: 'B3', name: '신경주역(KTX)', x: 20, y: 20 },
    ]
  };

  const schedule = [
    { time: '09:00', title: '출발', description: '서울역 KTX 3번 플랫폼 집결' },
    { time: '11:30', title: '도착 및 점심', description: '신경주역 도착. 유명 순두부찌개 맛집 점심.' },
    { time: '13:00', title: '미션 시작', description: '팀별 이동. 경주 탐방 시작.' },
    { time: '18:00', title: '체크인', description: '한옥 호텔 체크인.' },
    { time: '19:00', title: '저녁 및 바비큐', description: '바비큐 파티 + 레트로 회고.' },
  ];

  const currentGroup = groups.find(g => g.id === activeMapGroup) || groups[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Hero Section */}
      <Hero 
        title="2025 개발팀 워크샵"
        subtitle="경주 대모험"
        date="2025년 11월 24일 - 26일"
        location="대한민국 경주"
        imageUrl="https://images.unsplash.com/photo-1762246280136-f716157bef10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHeWVvbmdqdSUyMGhpc3RvcmljJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MzUyNTE1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      <main className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-8">
        
        {/* Map Section */}
        <section className="space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveMapGroup(group.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeMapGroup === group.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {group.name} 지도
                </button>
              ))}
            </div>
          </div>

          <MapDisplay 
            imageUrl="https://images.unsplash.com/photo-1736117703416-f260ee174bac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbGx1c3RyYXRlZCUyMG1hcCUyMHRvcCUyMHZpZXd8ZW58MXx8fHwxNzYzNTMwMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            locations={mapLocations[activeMapGroup as keyof typeof mapLocations]}
            markerColor={currentGroup.color}
          />
        </section>

        {/* Missions Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">팀 미션</h2>
          
          {/* Mobile View: Tabs */}
          <div className="md:hidden">
            <Tabs defaultValue="A" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                {groups.map(group => (
                  <TabsTrigger key={group.id} value={group.id} className="font-bold">
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {groups.map(group => (
                <TabsContent key={group.id} value={group.id}>
                  <GroupMissions 
                    group={group} 
                    onToggleMission={handleToggleMission} 
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Desktop View: Grid */}
          <div className="hidden md:grid grid-cols-2 gap-6">
            {groups.map(group => (
              <GroupMissions 
                key={group.id}
                group={group} 
                onToggleMission={handleToggleMission} 
              />
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <Timeline events={schedule} />
        </section>

      </main>
    </div>
  );
}
