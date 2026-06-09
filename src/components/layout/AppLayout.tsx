import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { NewPostModal } from "@/components/post/NewPostModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [showNewPost, setShowNewPost] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Sidebar onNewPost={() => setShowNewPost(true)} />
      <BottomNav onNewPost={() => setShowNewPost(true)} />

      {/* Main content */}
      <main className="md:ml-[244px] pb-20 md:pb-0">
        {children}
      </main>

      {/* New post modal */}
      <NewPostModal
        open={showNewPost}
        onClose={() => setShowNewPost(false)}
      />
    </div>
  );
}
