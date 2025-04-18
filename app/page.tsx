import GlobalSearch from "@/components/global-search";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <GlobalSearch />
    </main>
  );
}
