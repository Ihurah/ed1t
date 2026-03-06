// app/api/x/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.X_BEARER_TOKEN;
  const userId = process.env.X_USER_ID;

  // 日付フォーマット関数 (yyyy.mm.dd)
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  // モックデータを定義
  const fallbackData = [
    {
      type: "LATEST TWEET",
      text: "API制限のため、表示できておりません。",
      date: formatDate(new Date()),
      url: "https://x.com/i/user/1519176844703977472",
      likes: 10, // ★モックデータ
    },
    {
      type: "LATEST TWEET",
      text: "😢",
      date: formatDate(new Date()),
      url: "https://x.com/i/user/1519176844703977472",
      likes: 2, // ★モックデータ
    },
  ];

  // 設定がない場合はモックデータを返す
  if (!token || !userId) {
    return NextResponse.json(fallbackData);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&exclude=retweets,replies&tweet.fields=created_at,public_metrics,referenced_tweets`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        next: { revalidate: 600 },
      },
    );

    clearTimeout(timeoutId);

    // エラーが返ってきた場合はモックデータを返す
    if (!res.ok) {
      console.error(
        `X API Error (Status: ${res.status}) - Fallback to mock data`,
      );
      return NextResponse.json(fallbackData);
    }

    const data = await res.json();
    if (!data.data) return NextResponse.json(fallbackData);

    // 引用リツイートを除外
    const originalTweets = data.data.filter((tweet) => {
      if (!tweet.referenced_tweets) return true;
      return !tweet.referenced_tweets.some((ref) => ref.type === "quoted");
    });

    // 最新の2件を取得して整形
    const tweets = originalTweets.slice(0, 2).map((tweet) => ({
      type: "LATEST TWEET",
      text: tweet.text,
      date: formatDate(tweet.created_at),
      url: `https://twitter.com/${userId}/status/${tweet.id}`,
      likes: tweet.public_metrics?.like_count || 0, // ★いいね数を追加
    }));

    return NextResponse.json(tweets.length > 0 ? tweets : fallbackData);
  } catch (error) {
    console.error("X Fetch Error - Fallback to mock data:", error);
    // 通信エラーなどの場合もモックデータを返す
    return NextResponse.json(fallbackData);
  }
}
