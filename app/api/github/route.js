import { NextResponse } from "next/server";

export async function GET() {
  // 日付フォーマット関数 (yyyy.mm.dd)
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  try {
    const res = await fetch(
      "https://api.github.com/users/Ihurah/events/public",
      {
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) throw new Error("Failed to fetch from GitHub");

    const events = await res.json();

    // PushまたはCreateイベントをフィルタリング
    const targetEvents = events.filter(
      (e) => e.type === "PushEvent" || e.type === "CreateEvent",
    );

    if (!targetEvents.length) return NextResponse.json([]);

    // 最新2件を取得
    const results = targetEvents.slice(0, 2).map((evt) => {
      const repoName = evt.repo.name; // user/repo
      // シンプルなリポジトリ名のみ抽出 (例: Ihurah/Repo -> Repo)
      const simpleName = repoName.split("/")[1] || repoName;

      const message = evt.payload.commits
        ? evt.payload.commits[0].message
        : "Created a new repository";

      return {
        type: "LATEST ACTIVITY",
        text: simpleName, // リポジトリ名のみ
        date: formatDate(evt.created_at),
        url: `https://github.com/${repoName}`,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
