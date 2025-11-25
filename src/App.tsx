import React, { useState } from "react";
import { Hero } from "./components/Hero";
import { MapDisplay } from "./components/MapDisplay";
import { GroupMissions, Group } from "./components/GroupMissions";
import { Timeline } from "./components/Timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import heroImage from "/hero.jpg";

const GROUPS = [
  {
    id: "A",
    name: "🗽럼프 팀",
    members: ["aren", "geralt", "lucy", "amy"],
    color: "#ef4444", // red-500
    missions: [
      { id: 1, text: "첨성대에서 재미있는 단체 셀카 찍기", completed: false },
      { id: 2, text: "최고의 황남빵 찾아서 먹기", completed: false },
      { id: 3, text: "저녁 코드 퀴즈 우승하기", completed: false },
    ],
  },
  {
    id: "B",
    name: "🧧진핑 팀",
    members: ["jay", "jayce", "jinx", "vayne"],
    color: "#3b82f6", // blue-500
    missions: [
      { id: 1, text: "동궁과 월지에서 10초 브이로그 찍기", completed: false },
      { id: 2, text: "만원 이하로 독특한 기념품 사기", completed: false },
      { id: 3, text: "KTX에서 버그 픽스 커밋하기", completed: false },
    ],
  },
];

const MAP_LOCATIONS = {
  A: [
    { id: "A1", name: "첨성대", x: 45, y: 55 },
    { id: "A2", name: "황남빵 맛집", x: 35, y: 50 },
    { id: "A3", name: "퀴즈 행사장", x: 50, y: 60 },
  ],
  B: [
    { id: "B1", name: "동궁과 월지", x: 60, y: 40 },
    { id: "B2", name: "기념품 가게", x: 38, y: 52 },
    { id: "B3", name: "신경주역(KTX)", x: 20, y: 20 },
  ],
};

const SCHEDULE = [
  {
    time: "09:05",
    title: "출발",
    description: "수서역 SRT (동탄역 09:21분 도착)",
  },
  {
    time: "11:20",
    title: "경주역 도착",
    description: "경주역 도착. 쏘카 픽업 후 이동. (역내 황남빵 구매)",
  },
  {
    time: "12:00",
    title: "점심식사",
    description: "요석궁1779. 천미 天味 Chunmi.",
  },
  {
    time: "13:30",
    title: "팀별 미션수행",
    description: `🗽럼프팀: 경주박물관 → 월정교/최부자댁 → 설월당 
🧧진핑팀: 활리단길 → 경주타워/황룡원 → 브레스커피웍스`,
  },
  {
    time: "16:30",
    title: "미션종료",
    description: "경주역 쏘카 반납 후 집합. (KTX 16:50 출발)",
  },
  {
    time: "17:55",
    title: "대전 환승",
    description: "역내 섬심당에서 빵 구매. (KTX 18:25 출발)",
  },
  {
    time: "19:30",
    title: "서울역 도착",
    description: "",
  },
  {
    time: "19:30",
    title: "서울역 도착",
    description: "",
  },
];
export default function App() {
  const [activeMapGroup, setActiveMapGroup] = useState("A");

  const currentGroup = GROUPS.find((g) => g.id === activeMapGroup) || GROUPS[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans space-y-8">
      {/* Hero Section */}
      <Hero
        title="같이기차, 낭만여행"
        subtitle="함께·가치·낭만"
        date="2025년 11월 27일"
        location="대한민국 경주"
        imageUrl={heroImage}
      />

      <main className="max-w-4xl mx-auto px-4 mt-8 relative z-10 space-y-8">
        {/* Map Section */}
        <section className="space-y-4">
          <MapDisplay
            imageUrl="https://images.unsplash.com/photo-1736117703416-f260ee174bac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbGx1c3RyYXRlZCUyMG1hcCUyMHRvcCUyMHZpZXd8ZW58MXx8fHwxNzYzNTMwMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            locations={
              MAP_LOCATIONS[activeMapGroup as keyof typeof MAP_LOCATIONS]
            }
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
                {GROUPS.map((group) => (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className="font-bold"
                  >
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {GROUPS.map((group) => (
                <TabsContent key={group.id} value={group.id}>
                  <GroupMissions
                    group={group}
                    onToggleMission={(groupId) => setActiveMapGroup(groupId)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Desktop View: Grid */}
          <div className="hidden md:grid grid-cols-2 gap-6">
            {GROUPS.map((group) => (
              <GroupMissions
                key={group.id}
                group={group}
                onToggleMission={setActiveMapGroup}
              />
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <Timeline events={SCHEDULE} />
        </section>
      </main>
    </div>
  );
}
