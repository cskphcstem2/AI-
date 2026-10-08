import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { useTr } from "@/i18n/useTr";

export function AccountBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { user, logout } = useAuth();
  const { t } = useTr();
  if (!user) return null;
  const nameClass = tone === "dark" ? "text-[#d9d0c2]" : "text-ink-soft";
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="account-bar">
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="size-6 rounded-full border border-brass/40" referrerPolicy="no-referrer" />
      ) : null}
      <span className={`text-sm ${nameClass}`}>
        {t("代表")} {user.displayName}
      </span>
      <Button
        data-testid="auth-logout"
        size="sm"
        variant={tone === "dark" ? "line" : "quiet"}
        onClick={() => {
          void logout();
        }}
      >
        {t("登出")}
      </Button>
    </div>
  );
}
