import { NavWrapper } from "@/components/shared/nav-wrapper";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavWrapper />
      {children}
    </>
  );
}