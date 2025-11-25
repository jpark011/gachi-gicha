import { useState, useEffect, useRef } from "react";
import useLocalStorageState from "use-local-storage-state";
import { Hero } from "./components/Hero";
import { MapDisplay } from "./components/MapDisplay";
import { GroupMissions, Group } from "./components/GroupMissions";
import { Timeline } from "./components/Timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import heroImage from "/hero.jpg";

const GROUPS = [
  {
    id: "A",
    name: "🗽럼프 팀",
    members: ["aren", "geralt", "lucy", "amy"],
    color: "#ef4444", // red-500
    missions: [
      { id: 1, text: "요석궁에서 비밀쪽지 찾기", completed: false },
      { id: 2, text: "경주박물관에서 금관쓰고 사진찍기!", completed: false },
      { id: 3, text: "월정교 앞에서 단체 드론샷 찍기!!", completed: false },
    ],
  },
  {
    id: "B",
    name: "🧧진핑 팀",
    members: ["jay", "jayce", "jinx", "vayne"],
    color: "#3b82f6", // blue-500
    missions: [
      { id: 1, text: "요석궁에서 비밀쪽지 찾기", completed: false },
      { id: 2, text: "경주타워 앞에서 탑 만들기!", completed: false },
      { id: 3, text: "동서남북 나침반 포즈로 드론샷 찍기!!", completed: false },
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
    time: "09:00",
    title: "수서 출발",
    description: "수서역 SRT 09:05 출발\n(동탄역 도착: 09:21)",
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
    description: `· 🗽: 경주박물관 → 월정교/최부자댁 → 설월당 
· 🧧: 활리단길 → 경주타워/황룡원 → 브레스커피웍스`,
  },
  {
    time: "16:30",
    title: "미션종료",
    description: "경주역 쏘카 반납 후 집결. (KTX 16:50 출발)",
  },
  {
    time: "17:55",
    title: "대전 환승",
    description: "역내 섬심당에서 빵 구매. (KTX 18:25 출발)",
  },
  {
    time: "19:30",
    title: "서울역 도착",
    description: "서울역 물품보관함 이용가능",
  },
  {
    time: "20:00",
    title: "저녁식사",
    description: "삼수갑산",
  },
];

const STORAGE_KEY = "trip-planner-missions";

// Verification codes for mission 1 (4-digit codes)
const MISSION_1_CODES: Record<string, string> = {
  A: "9771", // Team A code
  B: "0821", // Team B code
};

// Helper function to merge stored groups with defaults
// This ensures new missions are added while preserving completion status
const mergeGroupsWithDefaults = (stored: Group[] | null): Group[] => {
  if (!stored) return GROUPS;

  return GROUPS.map((defaultGroup) => {
    const storedGroup = stored.find((g) => g.id === defaultGroup.id);
    if (!storedGroup) return defaultGroup;

    // Merge missions: preserve stored completion status, use default for new missions
    const mergedMissions = defaultGroup.missions.map((defaultMission) => {
      const storedMission = storedGroup.missions.find(
        (m) => m.id === defaultMission.id
      );
      return storedMission
        ? { ...defaultMission, completed: storedMission.completed }
        : defaultMission;
    });

    return { ...defaultGroup, missions: mergedMissions };
  });
};

export default function App() {
  const [activeMapGroup, setActiveMapGroup] = useState("A");
  const [groups, setGroups] = useLocalStorageState<Group[]>(STORAGE_KEY, {
    defaultValue: GROUPS,
    storageSync: true,
  });
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verifyingGroupId, setVerifyingGroupId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [verificationError, setVerificationError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Merge with defaults on mount to handle new missions
  useEffect(() => {
    const merged = mergeGroupsWithDefaults(groups);
    // Only update if merge resulted in changes (new missions added)
    const hasChanges = JSON.stringify(merged) !== JSON.stringify(groups);
    if (hasChanges) {
      setGroups(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const currentGroup = groups.find((g) => g.id === activeMapGroup) || groups[0];

  const handleMission1Click = (groupId: string) => {
    setVerifyingGroupId(groupId);
    setVerificationModalOpen(true);
    setVerificationCode(["", "", "", ""]);
    setVerificationError("");
    // Focus first input when modal opens
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleVerification = (codeToVerify?: string[]) => {
    if (!verifyingGroupId) return;

    // Use provided code or fall back to state
    const codeArray = codeToVerify || verificationCode;
    const enteredCode = codeArray.join("").trim();
    const correctCode = MISSION_1_CODES[verifyingGroupId];

    if (enteredCode === correctCode) {
      // Complete mission 1
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === verifyingGroupId
            ? {
                ...group,
                missions: group.missions.map((mission) =>
                  mission.id === 1 ? { ...mission, completed: true } : mission
                ),
              }
            : group
        )
      );
      setVerificationModalOpen(false);
      setVerificationCode(["", "", "", ""]);
      setVerificationError("");
      setVerifyingGroupId(null);
    } else {
      setVerificationError("잘못된 코드입니다. 다시 시도해주세요.");
      setVerificationCode(["", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    // Only allow single digit - take the last character if multiple entered
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit) return; // Don't update if no digit

    const newCode = [...verificationCode];
    newCode[index] = digit;
    setVerificationCode(newCode);
    setVerificationError("");

    // Auto-focus next input if digit entered
    if (digit && index < 3) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }

    // Auto-submit if all 4 digits entered - pass the newCode directly to avoid state timing issues
    const allFilled = newCode.every((d) => d !== "" && d.length === 1);
    if (allFilled && newCode.join("").length === 4) {
      setTimeout(() => {
        handleVerification(newCode);
      }, 100);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 4).split("");
        const newCode = [...verificationCode];
        digits.forEach((digit, i) => {
          if (i < 4) newCode[i] = digit;
        });
        setVerificationCode(newCode);
        if (digits.length === 4) {
          setTimeout(() => {
            handleVerification(newCode);
          }, 100);
        } else {
          inputRefs.current[Math.min(digits.length, 3)]?.focus();
        }
      });
    }
  };

  const handleToggleMission = (groupId: string, missionId: number) => {
    setGroups((prevGroups) => {
      const targetGroup = prevGroups.find((g) => g.id === groupId);
      if (!targetGroup) return prevGroups;

      // Prevent toggling missions 2 and 3 if mission 1 is not completed
      if (missionId > 1) {
        const mission1 = targetGroup.missions.find((m) => m.id === 1);
        if (!mission1?.completed) {
          return prevGroups; // Don't allow toggling if mission 1 is not completed
        }
      }

      return prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              missions: group.missions.map((mission) =>
                mission.id === missionId
                  ? { ...mission, completed: !mission.completed }
                  : mission
              ),
            }
          : group
      );
    });
  };

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
            <Tabs
              value={activeMapGroup}
              onValueChange={setActiveMapGroup}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                {groups.map((group) => (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className="font-bold"
                  >
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {groups.map((group) => (
                <TabsContent key={group.id} value={group.id}>
                  <GroupMissions
                    group={group}
                    onToggleMission={handleToggleMission}
                    onMission1Click={handleMission1Click}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Desktop View: Grid */}
          <div className="hidden md:grid grid-cols-2 gap-6">
            {groups.map((group) => (
              <GroupMissions
                key={group.id}
                group={group}
                onToggleMission={handleToggleMission}
                onMission1Click={handleMission1Click}
              />
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <Timeline events={SCHEDULE} />
        </section>
      </main>

      {/* Verification Modal */}
      <Dialog
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>미션 1 인증</DialogTitle>
            <DialogDescription>
              비밀쪽지에서 찾은 4자리 코드를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={verificationCode[index]}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-16 text-center text-3xl font-mono font-bold border-2 focus:border-primary"
                  autoComplete="off"
                />
              ))}
            </div>
            {verificationError && (
              <p className="text-sm text-red-500 text-center">
                {verificationError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setVerificationCode(["", "", "", ""]);
                setVerificationError("");
                setTimeout(() => {
                  inputRefs.current[0]?.focus();
                }, 10);
              }}
              className="w-full"
            >
              초기화
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
