"use client"

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  FileUserIcon,
  Frame,
  GalleryVerticalEnd,
  Map,
  Newspaper,
  PieChart,
  ScanSearch,
  User2Icon
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "User",
    email: "@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Account",
      url: "#",
      icon: User2Icon,
      isActive: true,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Recent",
          url: "#",
        },
        {
          title: "Chat",
          url: "#",
        },
      ],
    },
    {
      title: "Symptom Search",
      url: "#",
      icon: Bot,
    },
    {
      title: "Medicine Finder",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Disease Glossary",
      url: "#",
      icon: ScanSearch,
    },
    {
      title: "Appointment Notes",
      url: "#",
      icon: FileUserIcon,
    },
    {
      title: "Medical News",
      url: "#",
      icon: Newspaper
    }
  ],
  projects: [
    {
      name: "Web Map",
      url: "#",
      icon: Frame,
    },
    {
      name: "Statistics",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Glossary",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
