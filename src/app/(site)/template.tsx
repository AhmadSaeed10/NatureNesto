import { RouteFade } from "@/components/motion/RouteFade";

export default function Template({ children }: { children: React.ReactNode }) {
  return <RouteFade>{children}</RouteFade>;
}
