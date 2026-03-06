import { NextResponse } from "next/server";
import { Resend } from "resend";

// 環境変数からAPIキーを読み込む
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, body: messageBody } = body;

    // 必須項目のチェック
    if (!name || !email || !messageBody) {
      return NextResponse.json(
        { error: "必須項目（名前、Email、本文）が不足しています。" },
        { status: 400 },
      );
    }

    // メール送信実行
    const data = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // 独自ドメイン未設定ならこのままでOK
      to: [process.env.MY_EMAIL_ADDRESS], // .env.localで設定した自分のアドレス宛
      subject: `[Contact] Message from ${name}`,
      reply_to: email, // 返信先を相手のアドレスに指定
      text: `
--------------------------------------------------
Webサイトからのお問い合わせ
--------------------------------------------------

■お名前:
${name}

■Email:
${email}

■お問い合わせ内容:
${messageBody}
      `,
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "サーバー内部でエラーが発生しました。" },
      { status: 500 },
    );
  }
}
