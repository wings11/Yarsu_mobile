// app/(admin)/index.tsx
import { ReactNode } from "react";
import Dashboard from "./dashboard";

export default function Page({ children }: { children?: ReactNode }) {
  const toggleSidebar = () => {
    // TODO: implement sidebar toggle logic
  };

  return (
    <>{children ? children : <Dashboard toggleSidebar={toggleSidebar} />}</>
  );
}
