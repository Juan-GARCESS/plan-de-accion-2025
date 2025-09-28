// src/app/components/Sidebar.tsx
"use client";

import Link from "next/link";

const pages = ["Page 1", "Page 2", "Page 3", "Page 4", "Page 5"];

export default function Sidebar() {
  return (
    <aside className="w-48 bg-gray-100 min-h-screen p-4">
      <ul>
        {pages.map((page, index) => (
          <li key={index} className="mb-2">
            <Link
              href={`#${index + 1}`}
              className="block px-2 py-1 rounded hover:bg-gray-200"
            >
              {page}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
