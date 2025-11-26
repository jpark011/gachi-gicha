import { useState, useEffect, useRef } from "react";
import useLocalStorageState from "use-local-storage-state";
import confetti from "canvas-confetti";
import { Hero } from "./components/Hero";
import { MapDisplay } from "./components/MapDisplay";
import { GroupMissions, Group } from "./components/GroupMissions";
import { Timeline } from "./components/Timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Dialog,
  DialogContent,
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

// Gyeongju (경주) locations with real coordinates
const MAP_LOCATIONS = {
  A: [
    {
      id: "00",
      name: "요석궁1779",
      url: "https://kko.to/AnLRzIdhdG",
      lat: 35.8305534491356,
      lng: 129.217003047852,
    },
    {
      id: "A1",
      name: "국립경주박물관",
      url: "https://kko.kakao.com/q7vcYVoESy",
      lat: 35.8294300867523,
      lng: 129.228681914688,
    },
    {
      id: "A2",
      name: "최부자댁",
      url: "https://kko.kakao.com/yGf23ZadEt",
      lat: 35.8310316766874,
      lng: 129.215833534717,
    },
    {
      id: "A3",
      name: "월정교",
      url: "https://kko.kakao.com/QhX-WIPXjg",
      lat: 35.8290792077533,
      lng: 129.217322613795,
    },
    {
      id: "A4",
      name: "설월당",
      url: "https://kko.kakao.com/f5Gp_J42q9",
      lat: 35.8350776172556,
      lng: 129.212505765061,
    },
  ],
  B: [
    {
      id: "00",
      name: "요석궁1779",
      url: "https://kko.to/AnLRzIdhdG",
      lat: 35.8305534491356,
      lng: 129.217003047852,
    },
    {
      id: "B1",
      name: "황리단길",
      url: "https://kko.kakao.com/3VmOnTBb0C",
      lat: 35.8392936925501,
      lng: 129.209681679209,
    },
    {
      id: "B2",
      name: "경주타워",
      url: "https://kko.kakao.com/Gu8vFtBKcA",
      lat: 35.8322527041009,
      lng: 129.288867087571,
    },
    {
      id: "B3",
      name: "황룡원",
      url: "https://kko.kakao.com/yG57aWgiBQ",
      lat: 35.8368355746382,
      lng: 129.290065268344,
    },
    {
      id: "B4",
      name: "브레스커피웍스",
      url: "https://kko.kakao.com/NS0dlwA6hj",
      lat: 35.80333570855,
      lng: 129.313192015783,
    },
  ],
};

const SCHEDULE = [
  {
    time: "09:00",
    title: "수서역 출발",
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
· 🧧: 황리단길 → 경주타워/황룡원 → 브레스커피웍스`,
  },
  {
    time: "16:30",
    title: "미션종료",
    description: "경주역 쏘카 반납 후 집결. (KTX 16:50 출발)",
  },
  {
    time: "17:55",
    title: "대전역 환승",
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

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const triggerEpicConfetti = (teamColor?: string) => {
    const colors = teamColor
      ? [teamColor, "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"]
      : ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

    // Multiple bursts from different positions
    const duration = 3000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      // Burst from left
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
      });

      // Burst from right
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
      });

      // Burst from center
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: colors,
        shapes: ["circle", "square"],
      });
    }, 100);

    // Final massive burst
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 360,
        origin: { y: 0.5 },
        colors: colors,
        shapes: ["circle", "square", "star"],
        scalar: 1.2,
      });
    }, duration);
  };

  const handleVerification = (codeToVerify?: string[]) => {
    if (!verifyingGroupId) return;

    // Use provided code or fall back to state
    const codeArray = codeToVerify || verificationCode;
    const enteredCode = codeArray.join("").trim();
    const correctCode = MISSION_1_CODES[verifyingGroupId];

    if (enteredCode === correctCode) {
      // Complete mission 1
      setGroups((prevGroups) => {
        const newGroups = prevGroups.map((group) =>
          group.id === verifyingGroupId
            ? {
                ...group,
                missions: group.missions.map((mission) =>
                  mission.id === 1 ? { ...mission, completed: true } : mission
                ),
              }
            : group
        );

        // Check if all missions are now complete
        const updatedGroup = newGroups.find((g) => g.id === verifyingGroupId);
        const allComplete =
          updatedGroup?.missions.every((m) => m.completed) ?? false;

        if (allComplete) {
          triggerEpicConfetti(updatedGroup?.color);
        } else {
          triggerConfetti();
        }

        return newGroups;
      });
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

      // Check if mission is being completed (not uncompleted)
      const currentMission = targetGroup.missions.find(
        (m) => m.id === missionId
      );
      const isCompleting = !currentMission?.completed;

      const newGroups = prevGroups.map((group) =>
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

      // Trigger confetti if mission is being completed
      if (isCompleting) {
        // Check if all missions are now complete
        const updatedGroup = newGroups.find((g) => g.id === groupId);
        const allComplete =
          updatedGroup?.missions.every((m) => m.completed) ?? false;

        if (allComplete) {
          triggerEpicConfetti(updatedGroup?.color);
        } else {
          triggerConfetti();
        }
      }

      return newGroups;
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
            <DialogTitle>ENTER PASSCODE</DialogTitle>
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
              className="w-full text-red-500 border-red-500"
            >
              RESET
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
