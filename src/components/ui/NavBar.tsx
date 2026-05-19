"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props {
  user?: { name?: string | null; role?: string };
}

export function NavBar({ user }: Props) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/videos" className="font-bold text-lg text-gray-800 hover:text-blue-600">
          ラグビー動画分析
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {user.name}
              {user.role === "ADMIN" && (
                <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded">管理者</span>
              )}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-500 hover:text-gray-800"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
