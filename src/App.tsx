import { useEffect } from "react";
import { recordId } from "@/auth/auth";
import { useAuth } from "@/auth/AuthContext";
import { ChamberShell } from "@/components/chamber/ChamberShell";
import { languageMeta } from "@/i18n/languages";
import { DebriefScreen, VotingScreen } from "@/components/phases/ClosingScreens";
import { CaseSelectScreen } from "@/components/phases/CaseSelectScreen";
import { LobbyScreen } from "@/components/phases/LobbyScreen";
import { LoginScreen } from "@/components/phases/LoginScreen";
import { OpeningScreen } from "@/components/phases/OpeningScreen";
import { DraftingScreen } from "@/components/phases/DraftingScreen";
import { ModeratedScreen } from "@/components/phases/ModeratedScreen";
import { ChairScreen, DossierScreen, QuizScreen } from "@/components/phases/PrepScreens";
import { UnmoderatedScreen } from "@/components/phases/UnmoderatedScreen";
import { MultiplayerProvider, useMultiplayer } from "@/multiplayer/MultiplayerContext";
import { OnlineGameProvider } from "@/multiplayer/OnlineGameProvider";
import { RoomLobbyScreen } from "@/multiplayer/RoomLobbyScreen";
import { GameProvider } from "@/state/GameContext";
import { useGame } from "@/state/context";

function Screen() {
  const { state } = useGame();
  if (state.phase === "lobby" && !state.caseId) return <CaseSelectScreen />;
  if (state.phase === "lobby") return <LobbyScreen />;
  return (
    <ChamberShell>
      {state.phase === "chair" && <ChairScreen />}
      {state.phase === "dossier" && <DossierScreen />}
      {state.phase === "quiz" && <QuizScreen />}
      {state.phase === "opening" && <OpeningScreen />}
      {state.phase === "moderated" && <ModeratedScreen />}
      {state.phase === "unmoderated" && <UnmoderatedScreen />}
      {state.phase === "drafting" && <DraftingScreen />}
      {state.phase === "voting" && <VotingScreen />}
      {state.phase === "debrief" && <DebriefScreen />}
    </ChamberShell>
  );
}

function LanguageDocument() {
  const { state } = useGame();
  useEffect(() => {
    const meta = languageMeta(state.uiLanguage ?? "zh");
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
  }, [state.uiLanguage]);
  return null;
}

function OnlineLiveApp() {
  const mp = useMultiplayer();
  if (!mp.room?.game || !mp.mySeat) return null;
  return (
    <OnlineGameProvider room={mp.room} mySeat={mp.mySeat} isHost={mp.isHost}>
      <LanguageDocument />
      <Screen />
    </OnlineGameProvider>
  );
}

function SoloOrRoomLobby({ userId, legacyUserId }: { userId: string; legacyUserId: string }) {
  const mp = useMultiplayer();
  return (
    <GameProvider key={userId} userId={userId} legacyUserId={legacyUserId}>
      <LanguageDocument />
      {mp.inLobby ? <RoomLobbyScreen /> : <Screen />}
    </GameProvider>
  );
}

function SignedInApp({ userId, legacyUserId }: { userId: string; legacyUserId: string }) {
  const mp = useMultiplayer();
  if (mp.onlineLive) return <OnlineLiveApp />;
  return <SoloOrRoomLobby userId={userId} legacyUserId={legacyUserId} />;
}

export default function App() {
  const { ready, user } = useAuth();
  if (!ready) return null;
  if (!user) return <LoginScreen />;
  return (
    <MultiplayerProvider>
      <SignedInApp userId={recordId(user)} legacyUserId={user.id} />
    </MultiplayerProvider>
  );
}
